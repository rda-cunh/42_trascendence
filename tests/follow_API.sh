#!/usr/bin/env bash

set -e 

mkdir -p follow_tests/registered

CURL="curl --silent --show-error --insecure -X"
METHOD=("GET" "DELETE" "POST" "PATCH")
HEADER="Content-Type: application/json"
DOMAIN="https://127.0.0.1/api/"
DIR="follow_tests/"
ENROLL_DIR="follow_tests/registered/"
CREATED_USERS=20

run_test(){
	local endpoint=$2
	local output_file=$3
	local method=${METHOD[$1]}
	local body=${4:-null}
	echo -e "\e[1;31m/api/${endpoint} - ${method}\e[0m"
	${CURL} ${method} ${DOMAIN}${endpoint} -H "${HEADER}" -d "${body}" > "${ENROLL_DIR}${output_file}.json"
	sleep .4
}

USER1='{"name": "Rda-cunh", "email": "rda@email.com", "password": "securepass1", "phone": "+351123456789"}'
USER2='{"name": "Rapcampo", "email": "rcv@email.com", "password": "securepass2", "phone": "223456789"}'
USER3='{"name": "lvichi", "email": "lvichi@email.com", "password": "securepass3"}'
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
	sleep .3
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
	sleep .3
}

create_n_users() {
	local count=$1
	local start=${2:-1}
	for i in $(seq "$start" $(( start + count - 1 ))); do
		local body="{\"name\": \"user${i}\", \"email\": \"user${i}@email.com\", \"password\": \"securepass${i}\"}"
		declare -g "USER${i}=${body}"
		run_test 2 "auth/register/" "auth_register_user${i}" "${body}"
	done
}

PRODUCT1='{
  "user_id": "2",
  "name": "Product Name",
  "slug": "product-slug",
  "description": "This is a test description",
  "price": 99.90
}'

PRODUCT2='{
  "user_id": "2",
  "name": "Product 2 Name",
  "slug": "product-slug2",
  "description": "This is a test description",
  "price": 98.90
}'

PRODUCT3='{
  "user_id": "2",
  "name": "Product 3 Name",
  "slug": "product-slug3",
  "description": "This is a test description",
  "price": 97.90
}'

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
run_login_test "rap_login" "$LOG2"
run_login_test "lvi_login" "$LOG3"
run_login_test "lma_login" "$LOG4"
create_n_users $CREATED_USERS 5

RDA_TOKEN=$(python3 -c "import json; print(json.load(open('${DIR}rda_login.json')).get('access',''))")
RAP_TOKEN=$(python3 -c "import json; print(json.load(open('${DIR}rap_login.json')).get('access',''))")
LVI_TOKEN=$(python3 -c "import json; print(json.load(open('${DIR}lvi_login.json')).get('access',''))")
LMA_TOKEN=$(python3 -c "import json; print(json.load(open('${DIR}lma_login.json')).get('access',''))")

# run_auth_test "POST" "follow/" "follow_no_user" "${RDA_TOKEN}" "${PERROR}" "${DIR}rda_login.cookies"
for (( i=0; i < $CREATED_USERS + 4; i++ )); do
	run_auth_test "POST" "follow/" "follow_user${i}" "${RDA_TOKEN}" "{\"following_id\": ${i}}" "${DIR}rda_login.cookies"
done

# loops for internal follows
for (( i=1; i < 5; i++ )); do
	run_auth_test "POST" "follow/" "follow_user${i}" "${RAP_TOKEN}" "{\"following_id\": ${i}}" "${DIR}rap_login.cookies"
done

for (( i=1; i < 5; i++ )); do
	run_auth_test "POST" "follow/" "follow_user${i}" "${LVI_TOKEN}" "{\"following_id\": ${i}}" "${DIR}lvi_login.cookies"
done

for (( i=1; i < 5; i++ )); do
	run_auth_test "POST" "follow/" "follow_user${i}" "${LMA_TOKEN}" "{\"following_id\": ${i}}" "${DIR}lma_login.cookies"
done

for (( i=1; i<4; i++ )); do
	var="PRODUCT$i"
	run_auth_test "POST" "listings/" "product${i}" "${RAP_TOKEN}" "${!var}" "${DIR}rap_login.cookies"
done

# get follower count
run_auth_test "GET" "follow/counts/1/" "follow_count_rda" "${RDA_TOKEN}" "{}" "${DIR}rda_login.cookies"
run_auth_test "GET" "follow/counts/2/" "follow_count_rap" "${RDA_TOKEN}" "{}" "${DIR}rda_login.cookies"
run_auth_test "GET" "follow/counts/3/" "follow_count_lvi" "${RDA_TOKEN}" "{}" "${DIR}rda_login.cookies"
run_auth_test "GET" "follow/counts/4/" "follow_count_lma" "${RDA_TOKEN}" "{}" "${DIR}rda_login.cookies"

# get feed from rap
run_auth_test "GET" "follow/feed/" "feed" "${RDA_TOKEN}" "{}" "${DIR}rda_login.cookies"

# unfollow most people
for (( i=5; i < $CREATED_USERS + 2; i++ )); do
	run_auth_test "DELETE" "follow/" "unfollow_user${i}" "${RDA_TOKEN}" "{\"following_id\": ${i}}" "${DIR}rda_login.cookies"
done

run_auth_test "DELETE" "follow/" "unfollow_user1" "${RAP_TOKEN}" "{\"following_id\": 1}" "${DIR}rap_login.cookies"

# post delete count
run_auth_test "GET" "follow/counts/1/" "unfollow_count" "${RDA_TOKEN}" "{}" "${DIR}rda_login.cookies"
