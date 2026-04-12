#!/usr/bin/env bash

set -e 

mkdir -p ping_tests 

LOGIN_RESPONSE=$(curl -sS --insecure \
	-X POST "https://127.0.0.1/api/auth/login/" \
	-H "Content-Type: application/json" \
	-d '{"email":"admin@example.com","password":"securepass1"}')
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access // .token')
CURL="curl --insecure -X"
METHOD=("GET" "DELETE" "POST" "PATCH")
DOMAIN="https://127.0.0.1/api/"
DIR="ping_tests/"
HEADER="Authorization: Bearer $Token"

run_test(){
	local endpoint=$2
	local output_file=$3
	local method=${METHOD[$1]}
	echo -e "\e[1;31m/api/${endpoint} - ${method}\e[0m"
	${CURL} ${method} ${DOMAIN}${endpoint} -H "${HEADER}" -d "${body}" > ${DIR}${output_file}.json
	sleep .8
}
# .5 sleep added for rate limiting

# listings

run_test 0 "listings/" "listings_get"
run_test 2 "listings/" "listings_post"

# listings/id/

run_test 0 "listings/1/" "id_listings_get"
run_test 3 "listings/1/" "id_listings_patch"
run_test 1 "listings/1/" "id_listings_delete"

# listings/seller/id/

run_test 0 "listings/seller/1/" "id_seller_get"

# listings/{product_id}/images/

run_test 2 "listings/1/images/" "id_product_images_post"
run_test 0 "listings/1/images/" "id_product_images_get"

# listings/{product_id}/images/{image_id}/

run_test 1 "listings/1/images/1/" "image_id_delete"
run_test 0 "listings/1/images/1/" "image_id_get"

# listings/{product_id}/review/

run_test 2 "listings/1/review/" "id_product_review_post"
run_test 0 "listings/1/review/" "id_product_review_get"

# listings/{product_id}/review/{review_id}/

run_test 1 "listings/1/review/1/" "review_id_delete"
run_test 3 "listings/1/review/1/" "review_id_patch"

# orders/

run_test 0 "orders/" "orders_get"
run_test 2 "orders/" "orders_post"

# orders/id/

run_test 0 "orders/1/" "id_orders_get"
run_test 3 "orders/1/" "id_orders_patch"

# orders/buyer/id/

run_test 0 "orders/buyer/1/" "id_orders_get"

# payment/id/

run_test 0 "payment/1/" "payment_get"
run_test 1 "payment/1/" "payment_delete"
run_test 3 "payment/1/" "payment_patch"
run_test 2 "payment/1/" "payment_delete"

# auth/register/

run_test 2 "auth/register/" "auth_register_post"
run_test 1 "auth/register/" "auth_register_delete"

# auth/login/

run_test 2 "auth/login/" "auth_login_post"
run_test 1 "auth/login/" "auth_login_delete"

# auth/profile/

run_test 0 "auth/profile/1/" "auth_profile_get"
run_test 3 "auth/profile/1/" "auth_profile_patch"
run_test 1 "auth/profile/1/" "auth_profile_delete"

# auth/profile/password/

run_test 3 "auth/profile/password/1/" "auth_password_patch"

# auth/profile/address/

run_test 0 "auth/profile/address/1/" "auth_address_get"
run_test 1 "auth/profile/address/1/" "auth_address_post"
run_test 3 "auth/profile/address/1/" "auth_address_patch"
run_test 2 "auth/profile/address/1/" "auth_address_delete"

# users/

run_test 0 "users/" "user_list"

# users/id/

run_test 0 "users/1/" "user_id"

echo "done!"
