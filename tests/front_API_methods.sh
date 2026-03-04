#!/usr/bin/env bash

set -e 

mkdir -p api_tests

CURL="curl -X"
METHOD=("GET" "DELETE" "POST" "PATCH")
DOMAIN="http://127.0.0.1/api/"
DIR="api_tests/"

run_test(){
	local method_index=$1
	local endpoint=$2
	local output_file=$3
	local method=${METHODS[$method_index]}
	echo -e "\e[1;31m/api/${endpoint} - ${method}\e[0m"
	${CURL} ${method} ${DOMAIN}${endpoint} > ${DIR}${output_file}.html
}

# listings
# listings/id/
# orders
# orders/id/
# auth/login/
# auth/register/
# auth/profile/
# user/id/

run_test 0 "listings/" "listings_get"
run_test 2 "listings/" "listings_post"
run_test 0 "listings/1/" "id_listings_get"
run_test 3 "listings/1/" "id_listings_patch"
run_test 2 "listings/1" "id_listings_delete"
run_test 0 "orders/" "orders_get"
run_test 2 "orders/" "orders_post"
run_test 0 "orders/1/" "id_orders_get"
run_test 3 "orders/1/" "id_orders_patch"
run_test 0 "auth/profile/" "auth_profile_get"
run_test 2 "auth/login/" "auth_login_post"
run_test 1 "auth/login/" "auth_login_delete"
run_test 2 "auth/register/" "auth_register_post"
run_test 1 "auth/register/" "auth_register_delete"
run_test 0 "user/1/" "user_id"

echo "done!"
