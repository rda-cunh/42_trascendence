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
	${CURL} ${method} ${DOMAIN}${endpoint} -H "${HEADER}" -d "${body}" > ${DIR}${output_file}.json
	sleep 1
}
# OBS.: sleep may need to be increased due to rate limit

USER1='{"name": "Rda-cunh", "email": "rda@email.com", "password": "securepass1", "phone": "+351123456789"}'
USER2='{"name": "Rapcampo", "email": "rcv@email.com", "password": "securepass2", "phone": "223456789"}'

run_test 2 "auth/register/" "auth_register_1" "${USER1}"
run_test 2 "auth/register/" "auth_register_2" "${USER2}"
run_test 0 "users/1/" "user_id1"
run_test 0 "users/2/" "user_id2"
run_test 1 "auth/register/1/" "user_delete1"
run_test 1 "auth/register/2/" "user_delete2"
run_test 0 "users/1/" "user_id1"
run_test 0 "users/2/" "user_id2"
#run_test 2 "auth/login/" "auth_login_post"
#sleep(1)

echo "done!"
