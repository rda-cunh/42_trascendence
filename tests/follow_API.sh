#!/usr/bin/env bash

set -e 

mkdir -p follow_tests

CURL="curl --silent --show-error --insecure -X"
METHOD=("GET" "DELETE" "POST" "PATCH")
HEADER="Content-Type: application/json"
DOMAIN="https://127.0.0.1/api/"
DIR="follow_tests/"

run_test(){
	local endpoint=$2
	local output_file=$3
	local method=${METHOD[$1]}
	local body=${4:-null}
	echo -e "\e[1;31m/api/${endpoint} - ${method}\e[0m"
	${CURL} ${method} ${DOMAIN}${endpoint} -H "${HEADER}" -d "${body}" > "${DIR}${output_file}.json"
	sleep .8
}

USER1='{"name": "Rda-cunh", "email": "rda@email.com", "password": "securepass1", "phone": "+351123456789"}'
USER2='{"name": "Rapcampo", "email": "rcv@email.com", "password": "securepass2", "phone": "223456789"}'
USER3='{"name": "lvichi", "email": "lvichi@email.com", "password": "securepass3", "phone": ""}'
USER4='{"name": "lmaes", "email": "lmaes@email.com", "password": "securepass4"}'

LOG1='{"email": "rda@email.com", "password": "securepass1"}'
LOG2='{"email": "rcv@email.com", "password": "securepass2"}'
LOG3='{"email": "lvichi@email.com", "password": "securepass3"}'
LOG4='{"email": "lmaes@email.com", "password": "securepass4"}'


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

run_auth_test(){
	local method=$1
	local endpoint=$2
	local output_file=$3
	local access_token=$4
	local body=${5:-null}
	local cookie_file=${6:-null}

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

P1='{"following_id": 1}'
P2='{"following_id": 2}'
P3='{"following_id": 3}'
P4='{"following_id": 4}'
PERROR='{"following_id": 9999}'

# Register 4 users
run_test 2 "auth/register/" "auth_register_1" "${USER1}"
run_test 2 "auth/register/" "auth_register_2" "${USER2}"
run_test 2 "auth/register/" "auth_register_3" "${USER3}"
run_test 2 "auth/register/" "auth_register_4" "${USER4}"

# login for auth
run_login_test "rda_login" "$LOG1"

RDA_TOKEN=$(python3 -c "import json; print(json.load(open('${DIR}rda_login.json')).get('access',''))")
#RAP_TOKEN=$(python3 -c "import json; print(json.load(open('${DIR}rap_login.json')).get('access',''))")
#LVI_TOKEN=$(python3 -c "import json; print(json.load(open('${DIR}lvi_login.json')).get('access',''))")
#LMA_TOKEN=$(python3 -c "import json; print(json.load(open('${DIR}lma_login.json')).get('access',''))")

# follow self plus two
run_auth_test "POST" "follow/" "follow_self" "${RDA_TOKEN}" "${P1}" "${DIR}rda_login.cookies"
run_auth_test "POST" "follow/" "follow_rap" "${RDA_TOKEN}" "${P2}" "${DIR}rda_login.cookies"
run_auth_test "POST" "follow/" "follow_lvi" "${RDA_TOKEN}" "${P3}" "${DIR}rda_login.cookies"
run_auth_test "POST" "follow/" "follow_no_user" "${RDA_TOKEN}" "${PERROR}" "${DIR}rda_login.cookies"

# get follower count
run_auth_test "GET" "follow/counts/1/" "follow_count" "${RDA_TOKEN}" "{}" "${DIR}rda_login.cookies"

# unfollow
run_auth_test "DELETE" "follow/" "unfollow_self" "${RDA_TOKEN}" "${P1}" "${DIR}rda_login.cookies"
run_auth_test "DELETE" "follow/" "unfollow_rap" "${RDA_TOKEN}" "${P2}" "${DIR}rda_login.cookies"
run_auth_test "DELETE" "follow/" "unfollow_lvi" "${RDA_TOKEN}" "${P3}" "${DIR}rda_login.cookies"
run_auth_test "DELETE" "follow/" "unfollow_lma" "${RDA_TOKEN}" "${P4}" "${DIR}rda_login.cookies"

# post delete count
run_auth_test "GET" "follow/counts/1/" "unfollow_count" "${RDA_TOKEN}" "{}" "${DIR}rda_login.cookies"
