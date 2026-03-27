#!/usr/bin/env bash

set -e 

mkdir -p api_tests

CURL="curl -X"
METHOD=("GET" "DELETE" "POST" "PATCH")
HEADER="-H Content-Type: application/json"
DOMAIN="http://127.0.0.1/api/"
DIR="api_tests/"

run_test(){
	local endpoint=$2
	local output_file=$3
	local method=${METHOD[$1]}
	local body=$4
	echo -e "\e[1;31m/api/${endpoint} - ${method}\e[0m"
	${CURL} ${method} ${DOMAIN}${endpoint} ${HEADER} > ${DIR}${output_file}.html
}

REGISTERPOST="-d '{"name": "Person Name", "email": "example@email.com", "password": "examplepassword", "phone": "123456789"}'"

run_test 2 "auth/register/" "auth_register_post" ${REGISTERPOST}
sleep(1)
run_test 0 "user/1/" "user_id"
#run_test 2 "auth/login/" "auth_login_post"
#sleep(1)
#run_test 1 "auth/register/" "auth_register_delete"

echo "done!"
