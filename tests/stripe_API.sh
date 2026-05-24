#!/usr/bin/env bash

set -uo pipefail

mkdir -p stripe_tests

: "${STRIPE_SECRET_KEY:?STRIPE_SECRET_KEY must be exported}"
#STRIPE_SECRET_KEY=""

CURL="curl --show-error --silent --insecure -X"
HEADER="Content-Type: application/json"
DOMAIN="https://127.0.0.1/api/"
STRIPE_API="https://api.stripe.com/v1/"
DIR="stripe_tests/"

USER_LOGIN='{"email":"rda@email.com","password":"securepass1"}'
CART='{"items":[{"product_id":1,"quantity":2},{"product_id":2,"quantity":3}]}'

run_login_test(){
    local output_file=$1
    local body=$2
    echo -e "\e[1;34m/api/auth/login/ - POST\e[0m"
    curl --silent --show-error --insecure \
        -X POST "${DOMAIN}auth/login/" \
        -H "${HEADER}" \
        -d "${body}" \
        -c "${DIR}${output_file}.cookies" \
        -o "${DIR}${output_file}.json"
    sleep .5
}

run_auth_test(){
    local method=$1
    local endpoint=$2
    local output_file=$3
    local access_token=$4
    local body="${5:-null}"
    local cookie_file=$6

    echo -e "\e[1;34m/api/${endpoint} - ${method} (auth)\e[0m"
    curl --silent --show-error --insecure \
        -X "${method}" "${DOMAIN}${endpoint}" \
        -H "${HEADER}" \
        -H "Authorization: Bearer ${access_token}" \
        -b "${cookie_file}" \
        -d "${body}" \
        -o "${DIR}${output_file}.json" \
        -w "%{http_code}" > "${DIR}${output_file}.status"
    sleep .5
}

run_stripe_test(){
    local endpoint=$1
    local output_file=$2
    echo -e "\e[1;35mstripe.com/v1/${endpoint} - GET\e[0m"
    curl --silent --show-error \
        -u "${STRIPE_SECRET_KEY}:" \
        "${STRIPE_API}${endpoint}" \
        -o "${DIR}${output_file}.json" \
        -w "%{http_code}" > "${DIR}${output_file}.status"
    sleep .5
}

json_get(){
    python3 -c "import json,sys; print(json.load(open('$1')).get('$2',''))"
}

# 1. login as a regular user
run_login_test "user_login" "${USER_LOGIN}"
USER_TOKEN=$(json_get "${DIR}user_login.json" "access")

if [ -z "${USER_TOKEN}" ]; then
    echo -e "\e[1;31mLogin failed\e[0m"
    cat "${DIR}user_login.json"
    exit 1
fi

# 2. ask your backend to create a Stripe Checkout Session
run_auth_test "POST" "orders/create-checkout/" "create_session" \
    "${USER_TOKEN}" "${CART}" "${DIR}user_login.cookies"

SESSION_ID=$(json_get "${DIR}create_session.json" "session_id")
SESSION_URL=$(json_get "${DIR}create_session.json" "url")

if [ -z "${SESSION_ID}" ]; then
    echo -e "\e[1;31mBackend did not return a session_id\e[0m"
    cat "${DIR}create_session.json"
    exit 1
fi

echo -e "\e[1;32m✓ session_id: ${SESSION_ID}\e[0m"
echo -e "\e[1;32m✓ url: ${SESSION_URL}\e[0m"

# 3. hit Stripe directly and verify the session really exists there
run_stripe_test "checkout/sessions/${SESSION_ID}" "stripe_session"

PAYMENT_STATUS=$(json_get "${DIR}stripe_session.json" "payment_status")
AMOUNT_TOTAL=$(json_get "${DIR}stripe_session.json" "amount_total")
CURRENCY=$(json_get "${DIR}stripe_session.json" "currency")

echo -e "\e[1;36mStripe says:\e[0m"
echo -e "  payment_status: ${PAYMENT_STATUS}"
echo -e "  amount_total:   ${AMOUNT_TOTAL} (in smallest unit of ${CURRENCY})"

# 4. negative test — unauthenticated user can't create a session
echo -e "\e[1;34m/api/create-checkout-session/ - POST (no auth, should fail)\e[0m"
${CURL} POST "${DOMAIN}create-checkout-session/" \
    -H "${HEADER}" \
    -d "${CART}" \
    -o "${DIR}no_auth.json" \
    -w "%{http_code}\n" > "${DIR}no_auth.status"

cat "${DIR}no_auth.status"
