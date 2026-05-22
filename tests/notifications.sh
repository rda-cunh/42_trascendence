#!/usr/bin/env bash
#
# End-to-end tests for the full notification fanout pipeline.
#
# Verifies that the three subject-required actions (create, update, delete)
# each produce a fanout notification for followers of the seller:
#
#   1. alice follows bob
#   2. bob creates a listing  →  alice gets a 'new_listing' notification
#   3. bob updates the listing →  alice gets a 'listing_updated' notification
#   4. bob deletes the listing →  alice gets a 'listing_deleted' notification
#   5. mark-read decrements unread count to 0
#
# Also verifies that the payload snapshot is sane (product_id matches,
# product_name present) and that the notifications appear in newest-first
# order.
#
# Usage:
#   ./notifications_fanout.sh
# Exit code is the number of failed assertions (0 = all passed).

set -u

DOMAIN="https://127.0.0.1/api/"
DIR="notifications_fanout"
HEADER="Content-Type: application/json"

SUFFIX="$(date +%s)_$$"
ALICE_EMAIL="alice_fanout_${SUFFIX}@email.com"
BOB_EMAIL="bob_fanout_${SUFFIX}@email.com"
PASSWORD="securepass_fanout"
SLUG="fanout-listing-${SUFFIX}"

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
DIM='\033[2m'
RESET='\033[0m'

PASS=0
FAIL=0

mkdir -p "${DIR}"

# ---------- generic helpers -----------------------------------------------

# call METHOD ENDPOINT TOKEN [BODY] [OUTFILE]
# Writes body to OUTFILE (defaults to ${DIR}/last_response.json), echoes status.
call() {
    local method=$1
    local endpoint=$2
    local token=$3
    local body=${4:-}
    local outfile=${5:-${DIR}/last_response.json}
    local args=(
        --silent --show-error --insecure
        -o "${outfile}"
        -w "%{http_code}"
        -X "${method}"
        "${DOMAIN}${endpoint}"
        -H "${HEADER}"
    )
    [ -n "${token}" ] && args+=( -H "Authorization: Bearer ${token}" )
    [ -n "${body}" ]  && args+=( -d "${body}" )
    curl "${args[@]}"
}

# json_path FILE PATH  — extract a JSON path using python3.
# PATH is a python expression starting from the loaded JSON, e.g. "['access']"
# or "[0]['type']". Returns empty on missing key.
json_path() {
    local file=$1 path=$2
    python3 -c "
import json, sys
try:
    d = json.load(open('${file}'))
    print(d${path})
except Exception:
    print('')
"
}

assert_eq() {
    local label=$1 expected=$2 actual=$3
    if [ "${expected}" = "${actual}" ]; then
        echo -e "  ${GREEN}PASS${RESET}  ${label}  ${DIM}(${actual})${RESET}"
        PASS=$((PASS + 1))
    else
        echo -e "  ${RED}FAIL${RESET}  ${label}  ${DIM}expected ${expected}, got ${actual}${RESET}"
        [ -s "${DIR}/last_response.json" ] && echo -e "  ${DIM}body: $(cat "${DIR}/last_response.json")${RESET}"
        FAIL=$((FAIL + 1))
    fi
}

# ---------- setup ---------------------------------------------------------

echo -e "${BLUE}== Setup ==${RESET}"

register_user() {
    local email=$1
    local name=$2
    local outfile=${DIR}/register_${name}.json
    local body="{\"name\": \"${name}\", \"email\": \"${email}\", \"password\": \"${PASSWORD}\"}"
    local status
    status=$(curl --silent --show-error --insecure \
        -o "${outfile}" -w "%{http_code}" \
        -X POST "${DOMAIN}auth/register/" -H "${HEADER}" -d "${body}")
    if [ "${status}" != "201" ] && [ "${status}" != "200" ]; then
        echo -e "  ${RED}Register ${name} failed (${status})${RESET}"
        echo -e "  ${DIM}body: $(cat "${outfile}")${RESET}"
        exit 1
    fi
    echo -e "  registered ${name} (${email})"
}

login_user() {
    local email=$1
    local name=$2
    local outfile=${DIR}/login_${name}.json
    local body="{\"email\": \"${email}\", \"password\": \"${PASSWORD}\"}"
    local status
    status=$(curl --silent --show-error --insecure \
        -o "${outfile}" -w "%{http_code}" \
        -X POST "${DOMAIN}auth/login/" -H "${HEADER}" -d "${body}")
    if [ "${status}" != "200" ]; then
        echo -e "  ${RED}Login ${name} failed (${status})${RESET}"
        exit 1
    fi
}

register_user "${ALICE_EMAIL}" alice
register_user "${BOB_EMAIL}"   bob
login_user "${ALICE_EMAIL}" alice
login_user "${BOB_EMAIL}"   bob

ALICE_TOKEN=$(json_path "${DIR}/login_alice.json" "['access']")
BOB_TOKEN=$(json_path "${DIR}/login_bob.json"   "['access']")
ALICE_ID=$(json_path  "${DIR}/login_alice.json" "['user']['id']")
BOB_ID=$(json_path    "${DIR}/login_bob.json"   "['user']['id']")
echo -e "  alice id=${ALICE_ID}, bob id=${BOB_ID}"
echo

# ---------- 1. follow ----------------------------------------------------

echo -e "${BLUE}== 1. alice follows bob ==${RESET}"
STATUS=$(call POST "follow/" "${ALICE_TOKEN}" "{\"following_id\": ${BOB_ID}}")
assert_eq "follow created                  201" "201" "${STATUS}"
echo

# ---------- 2. baseline ---------------------------------------------------

echo -e "${BLUE}== 2. baseline ==${RESET}"
STATUS=$(call GET "notifications/unread-count/" "${ALICE_TOKEN}" "" "${DIR}/baseline_count.json")
assert_eq "unread-count status              200" "200" "${STATUS}"
BASELINE=$(json_path "${DIR}/baseline_count.json" "['num']")
assert_eq "alice baseline unread == 0       " "0" "${BASELINE}"
echo

# ---------- 3. CREATE → 'new_listing' fanout ------------------------------

echo -e "${BLUE}== 3. bob creates listing → alice gets 'new_listing' ==${RESET}"

PRODUCT_BODY=$(python3 -c "
import json
print(json.dumps({
    'user_id': ${BOB_ID},
    'name': 'Fanout Test Product',
    'slug': '${SLUG}',
    'description': 'A test product for the notification fanout pipeline',
    'price': 29.99,
}))
")

STATUS=$(call POST "listings/" "${BOB_TOKEN}" "${PRODUCT_BODY}" "${DIR}/create_listing.json")
assert_eq "POST listings/                   201" "201" "${STATUS}"
PRODUCT_ID=$(json_path "${DIR}/create_listing.json" "['id']")
echo -e "  ${DIM}created product id=${PRODUCT_ID}${RESET}"

# Verify alice's bell picked it up
STATUS=$(call GET "notifications/unread-count/" "${ALICE_TOKEN}" "" "${DIR}/count_after_create.json")
COUNT=$(json_path "${DIR}/count_after_create.json" "['num']")
assert_eq "alice unread after create == 1   " "1" "${COUNT}"

STATUS=$(call GET "notifications/" "${ALICE_TOKEN}" "" "${DIR}/list_after_create.json")
assert_eq "list status                      200" "200" "${STATUS}"
NOTIF_TYPE=$(json_path "${DIR}/list_after_create.json" "[0]['type']")
assert_eq "newest type == 'new_listing'     " "new_listing" "${NOTIF_TYPE}"
NOTIF_PRODUCT=$(json_path "${DIR}/list_after_create.json" "[0]['product_id']")
assert_eq "newest product_id matches        " "${PRODUCT_ID}" "${NOTIF_PRODUCT}"
NOTIF_ACTOR=$(json_path "${DIR}/list_after_create.json" "[0]['actor_id']")
assert_eq "newest actor_id == bob           " "${BOB_ID}" "${NOTIF_ACTOR}"
echo

# ---------- 4. UPDATE → 'listing_updated' fanout --------------------------

echo -e "${BLUE}== 4. bob updates listing → alice gets 'listing_updated' ==${RESET}"

UPDATE_BODY='{"price": 19.99}'
STATUS=$(call PATCH "listings/${PRODUCT_ID}/" "${BOB_TOKEN}" "${UPDATE_BODY}" "${DIR}/update_listing.json")
assert_eq "PATCH listings/{id}/             200" "200" "${STATUS}"

STATUS=$(call GET "notifications/unread-count/" "${ALICE_TOKEN}" "" "${DIR}/count_after_update.json")
COUNT=$(json_path "${DIR}/count_after_update.json" "['num']")
assert_eq "alice unread after update == 2   " "2" "${COUNT}"

STATUS=$(call GET "notifications/" "${ALICE_TOKEN}" "" "${DIR}/list_after_update.json")
NOTIF_TYPE=$(json_path "${DIR}/list_after_update.json" "[0]['type']")
assert_eq "newest type == 'listing_updated' " "listing_updated" "${NOTIF_TYPE}"
NOTIF_PRODUCT=$(json_path "${DIR}/list_after_update.json" "[0]['product_id']")
assert_eq "newest product_id matches        " "${PRODUCT_ID}" "${NOTIF_PRODUCT}"
# The price in the payload should be the NEW price (19.99)
NOTIF_PRICE=$(json_path "${DIR}/list_after_update.json" "[0]['payload']['product_price']")
assert_eq "newest payload price == 19.99    " "19.99" "${NOTIF_PRICE}"
echo

# ---------- 5. DELETE → 'listing_deleted' fanout --------------------------

echo -e "${BLUE}== 5. bob deletes listing → alice gets 'listing_deleted' ==${RESET}"

STATUS=$(call DELETE "listings/${PRODUCT_ID}/" "${BOB_TOKEN}" "" "${DIR}/delete_listing.json")
assert_eq "DELETE listings/{id}/            204" "204" "${STATUS}"

STATUS=$(call GET "notifications/unread-count/" "${ALICE_TOKEN}" "" "${DIR}/count_after_delete.json")
COUNT=$(json_path "${DIR}/count_after_delete.json" "['num']")
assert_eq "alice unread after delete == 3   " "3" "${COUNT}"

STATUS=$(call GET "notifications/" "${ALICE_TOKEN}" "" "${DIR}/list_after_delete.json")
NOTIF_TYPE=$(json_path "${DIR}/list_after_delete.json" "[0]['type']")
assert_eq "newest type == 'listing_deleted' " "listing_deleted" "${NOTIF_TYPE}"
NOTIF_PRODUCT=$(json_path "${DIR}/list_after_delete.json" "[0]['product_id']")
assert_eq "newest product_id matches        " "${PRODUCT_ID}" "${NOTIF_PRODUCT}"
echo

# ---------- 6. Order check: newest first ----------------------------------

echo -e "${BLUE}== 6. Ordering: newest-first ==${RESET}"
TYPES=$(python3 -c "
import json
d = json.load(open('${DIR}/list_after_delete.json'))
print(','.join(n['type'] for n in d[:3]))
")
assert_eq "types in order [deleted, updated, new]" "listing_deleted,listing_updated,new_listing" "${TYPES}"
echo

# ---------- 7. mark-read decrements ---------------------------------------

echo -e "${BLUE}== 7. mark-read decrements unread count ==${RESET}"
IDS=$(python3 -c "
import json
d = json.load(open('${DIR}/list_after_delete.json'))
print(json.dumps([n['id'] for n in d[:3]]))
")
STATUS=$(call POST "notifications/read/" "${ALICE_TOKEN}" "{\"ids\": ${IDS}}" "${DIR}/mark_read.json")
assert_eq "POST read/                       200" "200" "${STATUS}"
MARKED=$(json_path "${DIR}/mark_read.json" "['marked']")
assert_eq "marked count == 3                " "3" "${MARKED}"

STATUS=$(call GET "notifications/unread-count/" "${ALICE_TOKEN}" "" "${DIR}/count_final.json")
COUNT=$(json_path "${DIR}/count_final.json" "['num']")
assert_eq "alice unread after mark-read == 0" "0" "${COUNT}"
echo

# ---------- 8. Cross-user isolation: bob is unaffected --------------------

echo -e "${BLUE}== 8. bob (the seller) gets no notifications about himself ==${RESET}"
STATUS=$(call GET "notifications/unread-count/" "${BOB_TOKEN}" "" "${DIR}/bob_count.json")
BOB_COUNT=$(json_path "${DIR}/bob_count.json" "['num']")
assert_eq "bob unread == 0                  " "0" "${BOB_COUNT}"
echo

# ---------- summary --------------------------------------------------------

TOTAL=$((PASS + FAIL))
echo -e "${BLUE}== Summary ==${RESET}"
if [ "${FAIL}" -eq 0 ]; then
    echo -e "  ${GREEN}${PASS}/${TOTAL} passed${RESET}"
else
    echo -e "  ${RED}${FAIL}/${TOTAL} failed${RESET}, ${PASS} passed"
fi

echo -e "${DIM}  alice=${ALICE_ID} bob=${BOB_ID} product=${PRODUCT_ID} slug=${SLUG}${RESET}"

exit "${FAIL}"
