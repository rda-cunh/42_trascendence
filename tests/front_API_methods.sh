#!/usr/bin/env bash

set -e 

mkdir -p api_tests

CURL="curl -X"
METHOD=("GET" "DELETE" "POST" "PATCH")
DOMAIN="http://127.0.0.1/api/"
DIR="api_tests/"

echo -e "\e[1;31m/api/listings - GET out > listing_get.html\e[0m"

${CURL} ${METHOD[0]} ${DOMAIN}listings/ > ${DIR}listings_get.html

echo -e "\e[1;31mi/api/listings - POST out > listing_post.html\e[0m"

${CURL} ${METHOD[2]} ${DOMAIN}listings/ > ${DIR}listings_post.html

echo -e "\e[1;31mi/api/listings/{id} - GET out > id_listing_get.html\e[0m"

${CURL} ${METHOD[0]} ${DOMAIN}listings/1/ > ${DIR}id_listings_get.html

echo -e "\e[1;31mi/api/listings/{id} - PATCH out > id_listing_patch.html\e[0m"

${CURL} ${METHOD[3]} ${DOMAIN}listings/1/ > ${DIR}listings_patch.html

echo -e "\e[1;31mi/api/listings/{id} - DELETE out > id_listing_delete.html\e[0m"

${CURL} ${METHOD[1]} ${DOMAIN}listings/1/ > ${DIR}listings_delete.html

echo -e "\e[1;31mi/api/orders/{id} - GET out > id_orders_get.html\e[0m"

${CURL} ${METHOD[0]} ${DOMAIN}orders/1/ > ${DIR}id_orders_get.html

echo -e "\e[1;31mi/api/orders/{id} - PATCH out > id_orders_patch.html\e[0m"

${CURL} ${METHOD[3]} ${DOMAIN}orders/1/ > ${DIR}id_orders_patch.html

echo -e "\e[1;31mi/api/orders/ - POST out > orders_post.html\e[0m"

${CURL} ${METHOD[2]} ${DOMAIN}orders/ > ${DIR}orders_post.html

echo -e "\e[1;31mi/api/orders/ - GET out > orders_get.html\e[0m"

${CURL} ${METHOD[0]} ${DOMAIN}orders/ > ${DIR}orders_get.html

echo -e "\e[1;31mi/api/auth/profile - GET out > auth_profile_get.html\e[0m"

${CURL} ${METHOD[0]} ${DOMAIN}auth/profile/ > ${DIR}auth_profile_get.html

echo -e "\e[1;31mi/api/auth/login - POST out > auth_login_post.html\e[0m"

${CURL} ${METHOD[2]} ${DOMAIN}auth/login/ > ${DIR}auth_login_post.html

echo -e "\e[1;31mi/api/auth/login - DELETE out > auth_login_delete.html\e[0m"

${CURL} ${METHOD[1]} ${DOMAIN}auth/login/ > ${DIR}auth_login_delete.html

echo -e "\e[1;31mi/api/auth/register - POST out > auth_register_post.html\e[0m"

${CURL} ${METHOD[0]} ${DOMAIN}auth/register/ > ${DIR}auth_register_post.html

echo -e "\e[1;31mi/api/auth/register - DELETE out > auth_register_delete.html\e[0m"

${CURL} ${METHOD[1]} ${DOMAIN}auth/register/ > ${DIR}auth_register_delete.html

echo "done!"
