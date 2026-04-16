#!/usr/bin/env bash

set -e 

mkdir -p user_tests

CURL="curl --insecure -X"
METHOD=("GET" "DELETE" "POST" "PATCH")
HEADER="Content-Type: application/json"
DOMAIN="https://127.0.0.1/api/"
DIR="user_tests/"

run_test(){
	local endpoint=$2
	local output_file=$3
	local method=${METHOD[$1]}
	local body=$4
	echo -e "\e[1;31m/api/${endpoint} - ${method}\e[0m"
	${CURL} ${method} ${DOMAIN}${endpoint} -H "${HEADER}" -d "${body}" > "${DIR}${output_file}.json"
	sleep .8
}
# OBS.: sleep may need to be increased due to rate limit

# Simple POST helper (saves response body to .json and status code to .status)
run_post_test(){
	local endpoint=$1
	local output_file=$2
	local body=$3

	echo -e "\e[1;34m/api/${endpoint} - POST\e[0m"
	curl --silent --show-error --insecure \
		-X POST "${DOMAIN}${endpoint}" \
		-H "${HEADER}" \
		-d "${body}" \
		-o "${DIR}${output_file}.json" \
		-w "%{http_code}" > "${DIR}${output_file}.status"
	sleep 1
}

# Login helper (also captures headers and cookie so we can check the refresh_token)
run_login_test(){
	local output_file=$1
	local body=$2

	echo -e "\e[1;34m/api/auth/login/ - POST\e[0m"
	curl --silent --show-error --insecure \
		-X POST "${DOMAIN}auth/login/" \
		-H "${HEADER}" \
		-d "${body}" \
		-D "${DIR}${output_file}.headers" \
		-c "${DIR}${output_file}.cookies" \
		-o "${DIR}${output_file}.json" \
		-w "%{http_code}" > "${DIR}${output_file}.status"
	sleep 1
}

# Helper to test refresh tokens with cookie jar (cookie strored) | It uses cookie file from login to test valid refresh
run_refresh_with_cookie_file(){
	local output_file=$1
	local cookie_file=$2

	echo -e "\e[1;34m/api/${REFRESH_ENDPOINT} - POST (cookie file)\e[0m"
	curl --silent --show-error --insecure \
		-X POST "${DOMAIN}${REFRESH_ENDPOINT}" \
		-H "${HEADER}" \
		-b "${cookie_file}" \
		-o "${DIR}${output_file}.json" \
		-w "%{http_code}" > "${DIR}${output_file}.status"
	sleep 1
}

# Helper to test refresh tokens with cookie header (directly set cookie value) | It allows testing invalid cookies
run_refresh_with_cookie_header(){
	local output_file=$1
	local cookie_value=$2

	echo -e "\e[1;34m/api/${REFRESH_ENDPOINT} - POST (raw cookie)\e[0m"
	curl --silent --show-error --insecure \
		-X POST "${DOMAIN}${REFRESH_ENDPOINT}" \
		-H "${HEADER}" \
		-H "Cookie: refresh_token=${cookie_value}" \
		-o "${DIR}${output_file}.json" \
		-w "%{http_code}" > "${DIR}${output_file}.status"
	sleep 1
}


# Existing tests

USER1='{"name": "Rda-cunh", "email": "rda@email.com", "password": "securepass1", "phone": "+351123456789"}'
USER2='{"name": "Rapcampo", "email": "rcv@email.com", "password": "securepass2", "phone": "223456789"}'

run_test 2 "auth/register/" "auth_register_1" "${USER1}"
run_test 2 "auth/register/" "auth_register_2" "${USER2}"
run_test 0 "users/1/" "user_id1"
run_test 0 "users/2/" "user_id2"
run_test 2 "auth/login/" "auth_login_post" '{"email": "rda@email.com", "password": "securepass1"}'
#sleep(1)
#run_test 1 "auth/register/" "auth_register_delete"


# New tests

UNIQ_SUFFIX=$(date +%s)
TEST_EMAIL="auth_test_${UNIQ_SUFFIX}@email.com"
TEST_PASSWORD="securepass123"

VALID_USER_PAYLOAD="{\"name\":\"Auth Tester\",\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"phone\":\"+351123456781\"}"
DUPLICATE_USER_PAYLOAD="${VALID_USER_PAYLOAD}"
SHORT_PASSWORD_PAYLOAD="{\"name\":\"Short Pass\",\"email\":\"short_${UNIQ_SUFFIX}@email.com\",\"password\":\"123\",\"phone\":\"+351123456782\"}"
BAD_EMAIL_PAYLOAD="{\"name\":\"Bad Email\",\"email\":\"not-an-email\",\"password\":\"securepass123\",\"phone\":\"+351123456783\"}"

# Register — valid user
run_post_test "auth/register/" "register_valid" "${VALID_USER_PAYLOAD}"

# Register — duplicate user (same email)
run_post_test "auth/register/" "register_duplicate_email" "${DUPLICATE_USER_PAYLOAD}"

# Register — invalid fields: short password
run_post_test "auth/register/" "register_short_password" "${SHORT_PASSWORD_PAYLOAD}"

# Register — invalid fields: bad email
run_post_test "auth/register/" "register_bad_email" "${BAD_EMAIL_PAYLOAD}"

LOGIN_VALID_PAYLOAD="{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}"
LOGIN_WRONG_PASSWORD_PAYLOAD="{\"email\":\"${TEST_EMAIL}\",\"password\":\"wrong_password\"}"

# Login — correct return with access token
run_login_test "login_valid" "${LOGIN_VALID_PAYLOAD}"

# Login — wrong password
run_login_test "login_wrong_password" "${LOGIN_WRONG_PASSWORD_PAYLOAD}"

# Refresh — test with a valid cookie issues new access token (check refresh_valid_cookie.json (new access token) + .status
run_refresh_with_cookie_file "refresh_valid_cookie" "${DIR}login_valid.cookies"

# Refresh — missing cookie (must return 401 error)
run_post_test "${REFRESH_ENDPOINT}" "refresh_missing_cookie" "{}"

# Refresh — invalid cookie (must return 401 error)
run_refresh_with_cookie_header "refresh_invalid_cookie" "invalid.refresh.token"

echo "done!"
