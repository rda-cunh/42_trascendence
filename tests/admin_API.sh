#!/usr/bin/env bash

set -uo pipefail 

mkdir -p admin_tests

CURL="curl --insecure -X"
METHOD=("GET" "DELETE" "POST" "PATCH")
HEADER="Content-Type: application/json"
DOMAIN="https://127.0.0.1/api/"
DIR="admin_tests/"

run_test(){
	local endpoint=$2
	local output_file=$3
	local method=${METHOD[$1]}
	local body=$4:null
	echo -e "\e[1;31m/api/${endpoint} - ${method}\e[0m"
	${CURL} ${method} ${DOMAIN}${endpoint} -H "${HEADER}" -d "${body}" > "${DIR}${output_file}.json"
	sleep .8
}

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
	sleep .5
}

run_auth_test(){
	local method=$1
	local endpoint=$2
	local output_file=$3
	local access_token=$4
	local body=$5:null
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
	sleep .5
}

LOGIN="{\"email\": \"adm@email.com\",\"password\":\"123456789\"}"
USER1='{"name": "Rda-cunh", "email": "rda@email.com", "password": "securepass1", "phone": "+351123456789"}'
USER2='{"name": "Rapcampo", "email": "rcv@email.com", "password": "securepass2", "phone": "223456789"}'

# admin login -> create user 1 and 2 -> verify they exist -> admin bans user 1 -> verify
run_login_test "admin_login" "${LOGIN}"
run_test 2 "auth/register/" "auth_register_1" "${USER1}"
run_test 2 "auth/register/" "auth_register_2" "${USER2}"
run_test 0 "users/1/" "user_id1"
run_test 0 "users/2/" "user_id2"
run_auth_test "POST" "admin/bans/1/" "ban_user1" "${ACCESS_TOKEN}" "{}" "${DIR}login_valid.cookies"
run_test 0 "users/1/" "last_user_id1"
run_test 0 "users/2/" "last_user_id2"

