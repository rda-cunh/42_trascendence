
<details>
<summary><h1> Endpoints added for now </h1></summary>

### POST
```
/api/orders/                          Create new order
/api/listings/                        Create new product
/api/listings/{product_id}/images/    Add product image
/api/auth/register/                   Create new user
/api/auth/login/                      User login
/api/auth/address/{user_id}/          Add user address
```

### GET
```
/api/orders/{order_id}/                 Get specific order
/api/orders/buyer/{buyer_id}/           Get all orders for a buyer

/api/listings/                          List products (supports filters)
                                        Example:
                                        /listings?search=phone

/api/listings/{product_id}/             See Specific product

/api/listings/{product_id}/images/      List all images of a product
/api/listings/{product_id}/images/{image_id}/

/api/auth/profile/{user_id}/			Get Self profile
/api/users/{user_id}/                   Get specific user

/api/auth/address/{user_id}/            Get user addresses
```

### PATCH
```
(To be implemented)

PATCH /api/auth/profile/{user_id}/ Update user infos
PATCH /api/auth/profile/password/{user_id}/ Update password
PATCH /api/auth/address/{user_id}/
PATCH /api/listings/{product_id}/
PATCH /api/orders/{order_id}/
```

### DELETE
```
/api/listings/{product_id}/images/{image_id}/  ( Delete image from a product ) !
/api/listings/{product_id}/  ( Delete a product from table )


/api/auth/profile/{user_id}/  sets user as Deactivated
/api/register/{user_id}/  (Delete user from table)  -- Normally not used (sets user as Deactivated)
/api/users/address/{user_id}/  ( Delete address from table )
```


USER
 └── USER_ADDRESS

USER
 └── PRODUCTS
       └── PRODUCT_IMAGES

USER + USER_ADDRESS
 └── ORDERS
       └── ORDER_ITEMS


`USER don´t have dependences`
`USER_ADDRESS depends on USER`
`PRODUCTS depends on USER`
`PRODUCT_IMAGES depends on PRODUCT`
`ORDERS depends on USER and USER_ADDRESS`
`ORDER_ITEMS depends on ORDER and PRODUCT and USER`
`missing product_review`
`missing payments`


</details>


<details>
<summary><h1> User </h1></summary>


# - User Register (POST):
```
curl -X POST http://data-service:9000/api/auth/register/ -H "Content-Type: application/json" -d \
'{ \
"name" : "Person Name",
"email" : "example@email.com",
"password" : "examplepassword",
"phone" : "123456789",
"status" : "Active" (optional: default = Active),
"avatar_url" : "hashToImage" (optional)
}'
```

# - User Login (POST):
```
curl -X POST http://data-service:9000/api/auth/login/ -H "Content-Type: application/json" -d \
'{ \
"name" : "Person Name",
"password" : "examplepassword"
}'
```

# - User self profile (GET {user_id})
### (With pagination)
```
curl -X GET http://data-service:9000/api/auth/profile/{user_id}/?page=1
```

# - User (PATCH):
### (All fields are optional, so just put in, what you want to update)
```
curl -X PATCH http://data-service:9000/api/auth/profile/{user_id}/ -H "Content-Type: application/json" -d \
'{ \
"name" : "New Name",
"email" : "NewEmail@email.com",
"phone" : "NewPassword",
"status" : "Banned",
"avatar_url" : "NewHash"
}'
```

# - User Password (PATCH):
```
curl -X PATCH http://data-service:9000/api/auth/profile/password/{user_id}/ -H "Content-Type: application/json" -d \
'{ \
"oldPass" : "123456789",
"newPass" : "NewPassword"
}'
```

# - User Register (DELETE):
### Delete from table (Not used)
```
curl -X DELETE http://data-service:9000/api/auth/register/
```

# - User Register (DELETE):
### Set as deactivated (Normally used)
```
curl -X DELETE http://data-service:9000/api/auth/register/
```

</details>





<details>
<summary><h1> User Address </h1></summary>

# - User Address (POST):
```
curl -X POST "http://data-service:9000/api/users/address/{user_id}/" \
-H "Content-Type: application/json" \
-d '{
  "street": "Rua das Flores",
  "number": "123",
  "city": "Porto",
  "state": "Porto",
  "postal_code": "4000-001",
  "country": "Portugal"
}'
```

# - User Address (GET)
```
curl -X GET http://data-service:9000/api/users/address/{user_id}/ \
```

# - User Address (PATCH):
### (All fields are optional, so just put in, what you want to update)
```
curl -X PATCH "http://data-service:9000/api/users/address/{user_id}/" \
-H "Content-Type: application/json" \
-d '{
  "street": "New address",
  "number": "321",
  "city": "Lisbon",
  "state": "Lisbon",
  "postal_code": "1234-567",
  "country": "Portugal"
}'
```

# - User Address (DELETE):
```
curl -X DELETE http://data-service:9000/api/users/address/{user_id}/
```
(Delete specific user address from table)

</details>





<details>
<summary><h1> Products </h1></summary>

# - Add Products (POST):
```
curl -X POST http://data-service:9000/api/listings/?seller_id=1 \
-H "Content-Type: application/json" \
-d '{
  "user_id": "2",
  "name": "Product Name",
  "slug": "product-slug",
  "description": "This is a test description",
  "price": 99.90
}'
```



# - Products (GET) ( Search in name and description)
```
curl "http://data-service:9000/api/listings/?page=2&search=test&status=Active"
```


# - Products (GET {product_id})
```
curl "http://data-service:9000/api/listings/{product_id}/
```


# - Products  (PATCH):
```
curl -X PATCH http://data-service:9000/api/listings/{product_id}/ \
-H "Content-Type: application/json" \
-d '{
  "name": "Product Name",
  "slug": "product-slug",
  "description": "This is a test description",
  "price": 99.90,
  "status": "Paused"
}'
```


# - Products  (DELETE):
```
curl -X DELETE http://data-service:9000/api/listings/{product_id}/
```

</details>





<details>
<summary><h1> Product Images </h1></summary>

# - Product Images (POST):
```
curl -X POST "http://data-service:9000/api/listings/{product_id}/images" \
-H "Content-Type: application/json" \
-d '{
  "image_hash": "test-hash",
  "display_order": "1"
}'
```

# - Product Images (GET)
```
curl -X GET "http://data-service:9000/api/listings/{product_id}/images/"
```


# - Product Images (GET)
```
curl -X GET "http://data-service:9000/api/listings/{product_id}/images/{image_id}/"
```



# - Product Images (PATCH):
```
(To be implemented)
```


# - Product Images (DELETE):
```
curl -X DELETE "http://data-service:9000/api/listings/{product_id}/images/{image_id}/"
```

</details>





<details>
<summary><h1> Orders & Order Items </h1></summary>

# - Orders (POST):
```
curl -X POST http://data-service:9000/api/orders/ -H "Content-Type: application/json" -d '{
  "buyer_id": 1,
  "buyer_address_id": 1,
  "notes": "This is a test",
  "items": [
    {
      "product_id": 2,
      "qty": 1
    },
    {
      "product_id": 2,
      "qty": 2
    }
  ]
}'
```
**Response(Correct case):**
```
{
"id":1,
"code":"ORD-1172EEFF",
"buyer_id":1,
"buyer_address_id":1,
"status":"Pending",
"subtotal":"299.70",
"total":"299.70",
"notes":"This is a test",
"created_at":"2026-03-14T16:48:25",
"items":
[
{
"id":1,
"product_id":2,
"product_name":"Product Name1",
"price":"99.90",
"qty":1,
"subtotal":"99.90",
"seller_id":1
},
{
"id":2,
"product_id":2,
"product_name":"Product Name1",
"price":"99.90",
"qty":2,
"subtotal":"199.80",
"seller_id":1
}
]
}
```
**Response(Failed case):**
```
{"detail":"Product [item.product_id] not found or inactive"} (Invalid product id)
{"detail":"Invalid Reference (FK)"} (id is pointing to non existent data)
```


# - Orders  (GET)
```
curl "http://data-service:9000/api/orders/{order_id}/"
```
**Response(Correct case):**
```
{
"id":1,
"code":"ORD-1172EEFF",
"buyer_id":1,
"buyer_address_id":1,
"status":"Pending",
"subtotal":"299.70",
"total":"299.70",
"notes":"This is a test",
"created_at":"2026-03-14T16:48:25",
"items":
[
{
"id":1,
"product_id":2,
"product_name":"Product Name1",
"price":"99.90",
"qty":1,
"subtotal":"99.90",
"seller_id":1
},
{
"id":2,
"product_id":2,
"product_name":"Product Name1",
"price":"99.90",
"qty":2,
"subtotal":"199.80",
"seller_id":1
}
]
}
```
**Response(Failed case):**
```
{"detail":"Order not found"}
```


# - Orders  (GET) Specific order
```
curl "http://data-service:9000/api/orders/{order_id}/"
```


## - Orders  (GET) Per user (all orders)
```
curl "http://data-service:9000/api/orders/buyer/{user_id}/"
```



## - Orders  (PATCH):
```
curl -X POST http://data-service:9000/api/orders/ -H "Content-Type: application/json" -d '{
  "status": Paid
}'
```


## - Orders  (DELETE):
```
(To be implemented)
```

</details>







<details>
<summary><h1> Product Review </h1></summary>
(To be implemented)
</details>





<details>
<summary><h1> Payments </h1></summary>
(To be implemented)
</details>