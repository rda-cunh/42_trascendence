#!/usr/bin/env bash

set -euo pipefail 

mkdir -p grafana_tests

CURL="curl --show-error --silent --insecure -X"
METHOD=("GET" "DELETE" "POST" "PATCH")
HEADER="Content-Type: application/json"
DOMAIN="https://127.0.0.1/"
DIR="grafana_tests/"

run_test(){
	local endpoint=$2
	local output_file=$3
	local method=${METHOD[$1]}
	local body="${4:-null}"
	echo -e "\e[1;31m/api/${endpoint} - ${method}\e[0m"
	${CURL} ${method} ${DOMAIN}${endpoint} -H "${HEADER}" -d "${body}" > "${DIR}${output_file}.json"
	sleep .8
}

run_login_test(){
	local output_file=$1
	local body=$2

	echo -e "\e[1;34m/api/auth/login/ - POST\e[0m"
	curl --silent --show-error --insecure \
		-X POST "${DOMAIN}api/auth/login/" \
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
	local body="${5:-null}"
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
USER_LOGIN="{\"email\": \"rda@email.com\",\"password\":\"securepass1\"}"
USER1='{"name": "Rda-cunh", "email": "rda@email.com", "password": "securepass1", "phone": "+351123456789"}'
# admin login -> create user 1 and 2 -> verify they exist -> admin bans user 1 -> verify
run_login_test "admin_login" "${LOGIN}"
run_test 2 "api/auth/register/" "auth_register_1" "${USER1}"
run_login_test "user_login" "${USER_LOGIN}"
ACCESS_TOKEN=$(python3 -c "import json; print(json.load(open('${DIR}admin_login.json')).get('access',''))")
USER_TOKEN=$(python3 -c "import json; print(json.load(open('${DIR}user_login.json')).get('access',''))")
run_auth_test "GET" "metrics/" "admin_metric" "${ACCESS_TOKEN}" "{}" "${DIR}admin_login.cookies"
run_auth_test "GET" "metrics/" "user_metric" "${USER_TOKEN}" "{}" "${DIR}user_login.cookies"

