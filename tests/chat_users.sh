#!/usr/bin/env bash
set -euo pipefail

# base URL where our app is running
# -k is used in curl later because we are using local HTTPS/self-signed certs
BASE_URL="https://127.0.0.1"

# MySQL connection info from .env / docker
DB_CONTAINER="database"
DB_NAME="transcendence_db"
DB_USER="sql_user"
DB_PASSWORD="sql_pass"

# test buyer account that will appear in chat
BUYER_NAME="Chat Buyer"
BUYER_EMAIL="chat_buyer@example.com"
BUYER_PASSWORD="test123456"

# test seller account that owns the product and receives chat messages
SELLER_NAME="Chat Seller"
SELLER_EMAIL="chat_seller@example.com"
SELLER_PASSWORD="test123456"

# product used only to satisfy the foreign key: conversations.listing_id -> products.id
PRODUCT_NAME="Seeded Chat Product"
PRODUCT_SLUG="seeded-chat-product"
PRODUCT_DESCRIPTION="Temporary product used only for chat testing"
PRODUCT_PRICE="19.99"

# first chat message manually inserted into the DB
FIRST_MESSAGE="hello from chat"

# small helper: stop early if a required tool is missing.
need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

# we need:
# - curl to call backend API
# - jq to extract JSON fields from API responses
# - docker to run mysql commands inside the DB container
need_cmd curl
need_cmd jq
need_cmd docker

# register a user through backend API (use the API instead of inserting directly into MySQL)
register_user() {
  local name="$1"
  local email="$2"
  local password="$3"

  curl -k -sS -X POST "$BASE_URL/api/auth/register/" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
      --arg name "$name" \
      --arg email "$email" \
      --arg password "$password" \
      '{name:$name,email:$email,password:$password}')"
}

# Login using the backend API and return the full JSON response (access token + user object).
login_user() {
  local email="$1"
  local password="$2"

  curl -k -sS -X POST "$BASE_URL/api/auth/login/" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
      --arg email "$email" \
      --arg password "$password" \
      '{email:$email,password:$password}')"
}

# run a SQL query inside the MySQL container (keeps the output easier to parse in scripts)
mysql_query() {
  local sql="$1"
  docker exec "$DB_CONTAINER" mysql \
    -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -Nse "$sql"
}

# safe JSON field extraction helper (returns empty string if field is missing or null)
safe_json_field() {
  local json="$1"
  local field="$2"
  echo "$json" | jq -r "$field // empty"
}

echo "== Creating users =="

# create the two users that will appear in the chat (buyer and seller) 
# '|| true' means: if the user already exists, do not stop the script here
register_user "$BUYER_NAME" "$BUYER_EMAIL" "$BUYER_PASSWORD" || true
register_user "$SELLER_NAME" "$SELLER_EMAIL" "$SELLER_PASSWORD" || true

echo "== Logging in users =="

# login both users so we can:
# - confirm the accounts exist
# - get the real database user IDs
# - get access tokens (for debugging)
BUYER_LOGIN="$(login_user "$BUYER_EMAIL" "$BUYER_PASSWORD")"
SELLER_LOGIN="$(login_user "$SELLER_EMAIL" "$SELLER_PASSWORD")"

echo "Buyer login response:"
echo "$BUYER_LOGIN" | jq .

echo "Seller login response:"
echo "$SELLER_LOGIN" | jq .

# extract useful fields from the login JSON.
BUYER_ID="$(safe_json_field "$BUYER_LOGIN" '.user.id')"
SELLER_ID="$(safe_json_field "$SELLER_LOGIN" '.user.id')"
BUYER_TOKEN="$(safe_json_field "$BUYER_LOGIN" '.access')"
SELLER_TOKEN="$(safe_json_field "$SELLER_LOGIN" '.access')"

# fail early if login did not return valid user IDs (which are needed for the rest of the script)
if [[ -z "$BUYER_ID" ]]; then
  echo "Failed to get buyer id from login response" >&2
  exit 1
fi

if [[ -z "$SELLER_ID" ]]; then
  echo "Failed to get seller id from login response" >&2
  exit 1
fi

echo "== IDs =="
echo "Buyer ID:  $BUYER_ID"
echo "Seller ID: $SELLER_ID"

# escape single quotes so text is safe to inject in SQL strings. Example: don't -> don''t
ESCAPED_PRODUCT_NAME="$(printf "%s" "$PRODUCT_NAME" | sed "s/'/''/g")"
ESCAPED_PRODUCT_SLUG="$(printf "%s" "$PRODUCT_SLUG" | sed "s/'/''/g")"
ESCAPED_PRODUCT_DESCRIPTION="$(printf "%s" "$PRODUCT_DESCRIPTION" | sed "s/'/''/g")"
ESCAPED_MESSAGE="$(printf "%s" "$FIRST_MESSAGE" | sed "s/'/''/g")"

echo "== Ensuring product exists =="

# a conversation must reference a real product:
# conversations.listing_id -> products.id
#
# products.slug is UNIQUE, so we can safely use:
# INSERT ... ON DUPLICATE KEY UPDATE
#
# The LAST_INSERT_ID(id) trick is important here:
# it makes MySQL return the existing product ID even if the row already exists.
PRODUCT_ID="$(mysql_query "
INSERT INTO products (seller_id, name, slug, description, price, status)
VALUES ($SELLER_ID, '$ESCAPED_PRODUCT_NAME', '$ESCAPED_PRODUCT_SLUG', '$ESCAPED_PRODUCT_DESCRIPTION', $PRODUCT_PRICE, 'Active')
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), seller_id = VALUES(seller_id);
SELECT LAST_INSERT_ID();
")"

if [[ -z "$PRODUCT_ID" || "$PRODUCT_ID" == "0" ]]; then
  echo "Failed to create or fetch product" >&2
  exit 1
fi

echo "Product ID: $PRODUCT_ID"

echo "== Creating conversation =="

# insert a new conversation between buyer and seller for that product. We also prefill last_message and last_message_at so the conversation list can show a preview immediately
CONVERSATION_ID="$(mysql_query "
INSERT INTO conversations (listing_id, buyer_id, seller_id, last_message, last_message_at)
VALUES ($PRODUCT_ID, $BUYER_ID, $SELLER_ID, '$ESCAPED_MESSAGE', NOW());
SELECT LAST_INSERT_ID();
")"

if [[ -z "$CONVERSATION_ID" || "$CONVERSATION_ID" == "0" ]]; then
  echo "Failed to create conversation" >&2
  exit 1
fi

echo "Conversation ID: $CONVERSATION_ID"

echo "== Creating first message =="

# insert the first chat message in the messages table.
MESSAGE_ID="$(mysql_query "
INSERT INTO messages (conversation_id, sender_id, content)
VALUES ($CONVERSATION_ID, $BUYER_ID, '$ESCAPED_MESSAGE');
SELECT LAST_INSERT_ID();
")"

if [[ -z "$MESSAGE_ID" || "$MESSAGE_ID" == "0" ]]; then
  echo "Failed to create first message" >&2
  exit 1
fi

echo "Message ID: $MESSAGE_ID"

echo "== Verifying seeded data =="

# print back the inserted conversation and message so you can visually confirm.
mysql_query "SELECT id, listing_id, buyer_id, seller_id, last_message, last_message_at FROM conversations WHERE id = $CONVERSATION_ID;"
mysql_query "SELECT id, conversation_id, sender_id, content, created_at FROM messages WHERE id = $MESSAGE_ID;"

echo
echo "== Seed completed successfully =="
echo "Buyer login:  $BUYER_EMAIL / $BUYER_PASSWORD"
echo "Seller login: $SELLER_EMAIL / $SELLER_PASSWORD"
echo "Frontend URL: $BASE_URL"
echo
echo "Now:"
echo "1) Open $BASE_URL"
echo "2) Login as buyer or seller"
echo "3) Go to the Chat page"
echo
echo "Buyer access token:"
echo "$BUYER_TOKEN"
echo
echo "Seller access token:"
echo "$SELLER_TOKEN"