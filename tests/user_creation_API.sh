#!/usr/bin/env bash

set -e 

mkdir -p user_tests

# OBS.: One can extract status code from curl with curl -w
# may want to use that to check for expected status
# example of how it would work bellow
# HTTP_CODE=$(curl -sS --insecure -o out.json -w "%{http_code}" ...)
#echo "$HTTP_CODE" > out.status

CURL="curl --insecure -X"
METHOD=("GET" "DELETE" "POST" "PATCH")
HEADER="Content-Type: application/json"
DOMAIN="https://127.0.0.1/api/"
DIR="user_tests/"
REFRESH_ENDPOINT="auth/refresh/"

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

# generic helper that captures headers, status and optional cookies (used to test OAuth login)
run_get_test(){
	local endpoint=$1
	local output_file=$2
	local cookie_file=$3
	local save_cookies_to=$4

	echo -e "\e[1;34m/api/${endpoint} - GET\e[0m"

	local curl_cmd=(
		curl --silent --show-error --insecure
		-X GET "${DOMAIN}${endpoint}"
		-H "${HEADER}"
		-D "${DIR}${output_file}.headers"
		-o "${DIR}${output_file}.json"
		-w "%{http_code}"
	)

	if [ -n "${cookie_file}" ]; then
		curl_cmd+=( -b "${cookie_file}" )
	fi

	if [ -n "${save_cookies_to}" ]; then
		curl_cmd+=( -c "${save_cookies_to}" )
	fi

	"${curl_cmd[@]}" > "${DIR}${output_file}.status"
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


# Generic helper for JSON endpoints | if access_token is provided adds Authorization: Bearer <token>, otherwise if access_token is empty do not send Authorization header.
run_auth_test(){
	local method=$1
	local endpoint=$2
	local output_file=$3
	local access_token=$4
	local body=$5
	local cookie_file=$6

	echo -e "\e[1;34m/api/${endpoint} - ${method} (auth)\e[0m"

	local curl_cmd=(
		curl --silent --show-error --insecure
		-X "${method}" "${DOMAIN}${endpoint}"
		-H "${HEADER}"
	)

	if [ -n "${access_token}" ]; then
		curl_cmd+=( -H "Authorization: Bearer ${access_token}" )
	fi

	if [ -n "${cookie_file}" ]; then
		curl_cmd+=( -b "${cookie_file}" )
	fi

	if [ -n "${body}" ]; then
		curl_cmd+=( -d "${body}" )
	fi

	"${curl_cmd[@]}" \
		-o "${DIR}${output_file}.json" \
		-w "%{http_code}" > "${DIR}${output_file}.status"
	sleep 1
}

# Prints status and redirect location from a saved response.
print_http_summary(){
	local prefix=$1
	local status_file="${DIR}${prefix}.status"
	local headers_file="${DIR}${prefix}.headers"
	local status="N/A"
	local location="(none)"

	if [ -f "${status_file}" ]; then
		status=$(cat "${status_file}")
	fi

	if [ -f "${headers_file}" ]; then
		location=$(awk 'BEGIN{IGNORECASE=1} /^Location:/ {sub(/\r/,""); print $2; exit}' "${headers_file}")
		[ -z "${location}" ] && location="(none)"
	fi

	echo "  -> status: ${status} | location: ${location}"
}

# prints status and redirect location from saved response (OAuth tests with redirect)
print_http_summary(){
	local prefix=$1
	local status_file="${DIR}${prefix}.status"
	local headers_file="${DIR}${prefix}.headers"
	local status="N/A"
	local location="(none)"

	if [ -f "${status_file}" ]; then
		status=$(cat "${status_file}")
	fi

	if [ -f "${headers_file}" ]; then
		location=$(awk 'BEGIN{IGNORECASE=1} /^Location:/ {sub(/\r/,""); print $2; exit}' "${headers_file}")
		[ -z "${location}" ] && location="(none)"
	fi

	echo "  -> status: ${status} | location: ${location}"
}

# Existing tests

USER1='{"name": "Rda-cunh", "email": "rda@email.com", "password": "securepass1", "phone": "+351123456789"}'
USER2='{"name": "Rapcampo", "email": "rcv@email.com", "password": "securepass2", "phone": "223456789"}'
LOG1='{"email": "rda@email.com", "password": "securepass1"}'
LOG2='{"email": "rcv@email.com", "password": "securepass2"}'

run_test 2 "auth/register/" "auth_register_1" "${USER1}"
run_test 2 "auth/register/" "auth_register_2" "${USER2}"
run_test 0 "users/1/" "user_id1"
run_test 0 "users/2/" "user_id2"
#run_test 1 "auth/login/" "auth_login_delete_1"
#run_test 1 "auth/login/" "auth_login_delete_2"
#run_test 1 "auth/register/1/" "user_delete1"
#run_test 1 "auth/register/2/" "user_delete2"
#run_test 0 "users/1/" "last_user_id1"
#run_test 0 "users/2/" "last_user_id2"
run_test 2 "auth/login/" "auth_login_post" '{"email": "rda@email.com", "password": "securepass1"}'


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

ACCESS_TOKEN=$(python3 -c "import json; print(json.load(open('${DIR}login_valid.json')).get('access',''))")

# Logout — valid refresh token should be blacklisted and cookie cleared
run_auth_test "POST" "auth/logout/" "logout_valid" "${ACCESS_TOKEN}" "{}" "${DIR}login_valid.cookies"

# Logout — second logout with same refresh token should fail (token already blacklisted)
run_auth_test "POST" "auth/logout/" "logout_second_same_token" "${ACCESS_TOKEN}" "{}" "${DIR}login_valid.cookies"

# Profile GET — valid JWT returns user data
run_auth_test "GET" "auth/profile/" "profile_get_valid_jwt" "${ACCESS_TOKEN}" "" ""

# Profile GET — missing JWT returns 401
run_auth_test "GET" "auth/profile/" "profile_get_missing_jwt" "" "" ""

# Profile PATCH — valid fields update correctly
PROFILE_PATCH_VALID_PAYLOAD="{\"name\":\"Auth Tester Updated\",\"phone\":\"+351123456780\"}"
run_auth_test "PATCH" "auth/profile/" "profile_patch_valid_fields" "${ACCESS_TOKEN}" "${PROFILE_PATCH_VALID_PAYLOAD}" ""

# Profile PATCH — invalid field should be rejected by serializer
PROFILE_PATCH_INVALID_PAYLOAD="{\"email\":\"cannot_change_here@email.com\"}"
run_auth_test "PATCH" "auth/profile/" "profile_patch_invalid_fields" "${ACCESS_TOKEN}" "${PROFILE_PATCH_INVALID_PAYLOAD}" ""

# Password PATCH — old and new password validated
PASSWORD_PATCH_VALID_PAYLOAD="{\"password\":\"${TEST_PASSWORD}\",\"new_password\":\"${TEST_PASSWORD}X\"}"
run_auth_test "PATCH" "auth/password/" "password_patch_valid" "${ACCESS_TOKEN}" "${PASSWORD_PATCH_VALID_PAYLOAD}" ""

# Password PATCH — same password should be rejected
PASSWORD_PATCH_SAME_PAYLOAD="{\"password\":\"${TEST_PASSWORD}\",\"new_password\":\"${TEST_PASSWORD}\"}"
run_auth_test "PATCH" "auth/password/" "password_patch_same_password" "${ACCESS_TOKEN}" "${PASSWORD_PATCH_SAME_PAYLOAD}" ""

 # OAUTH 42 BACKEND TESTS (just checking the flow and redirects as we cannot automate the 42 login)

OAUTH_START_ENDPOINT="auth/42/"
OAUTH_CALLBACK_ENDPOINT="auth/42/callback/"

echo -e "\n\e[1;33mRunning OAuth backend tests...\e[0m"

# 1. start OAuth: should redirect to 42 authorize endpoint and set oauth42_state cookie
run_get_test "${OAUTH_START_ENDPOINT}" "oauth_start" "" "${DIR}oauth_state.cookies"
print_http_summary "oauth_start"

# Extract oauth42_state value from cookie jar
OAUTH_STATE=$(awk '$6=="oauth42_state" {print $7; exit}' "${DIR}oauth_state.cookies" 2>/dev/null || true)

if [ -z "${OAUTH_STATE}" ]; then
	echo -e "\e[1;31m[WARN] oauth42_state cookie was not captured. Callback validation tests may fail.\e[0m"
fi

# 2. callback with missing state (simulate CSRF / malformed callback). It will fail
run_get_test "${OAUTH_CALLBACK_ENDPOINT}?code=fake_code_no_state" "oauth_callback_missing_state" "" ""
print_http_summary "oauth_callback_missing_state"

# 3. callback with valid state but fake code should fail token exchange and redirect to failure
if [ -n "${OAUTH_STATE}" ]; then
	run_get_test "${OAUTH_CALLBACK_ENDPOINT}?code=fake_code_with_state&state=${OAUTH_STATE}" "oauth_callback_fake_code" "${DIR}oauth_state.cookies" ""
	print_http_summary "oauth_callback_fake_code"
fi

echo "done!"
