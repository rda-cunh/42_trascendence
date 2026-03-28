
<details>
<summary><h1> Endpoints added for now </h1></summary>

### POST
```
/api/orders                      Create new order
/api/listings                    Create new product
/api/listings/{product_id}/images Add product image
/api/users                       Create new user
/api/users/{user_id}/address     Add user address
```

### GET
```
/api/orders/{order_id}                 Get specific order
/api/orders/buyer/{buyer_id}           Get all orders for a buyer

/api/listings                          List products (supports filters)
                                    Example:
                                    /listings?search=phone

/api/listings/seller/{seller_id}       List products by seller

/api/listings/{product_id}/images      List all images of a product
/api/listings/{product_id}/images/{image_id}

users                              List all users
/api/users/{user_id}                   Get specific user

/api/users/{user_id}/address           Get user addresses
```

### PATCH
```
(To be implemented)

PATCH /api/users/{user_id}
PATCH /api/listings/{product_id}
PATCH /api/orders/{order_id}
PATCH /api/users/{user_id}/address/{address_id}
```

### DELETE
```
/api/listings/{product_id}/images/{image_id}  ( Delete image from a product )
/api/listings/{product_id}  ( Delete a product from table )

/api/users/{user_id}  (Delete user from table)  -- Normally not used (sets user as Deactivated)
/api/users/{user_id}/address  ( Delete address from table )
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

> ### Finishing other CRUDs to pull

## - User (POST):
```
curl -X POST http://data-service:9000/api/users/ -H "Content-Type: application/json" -d \
'{ \
"name" : "Person Name",
"email" : "example@email.com",
"password" : "examplepassword",
"phone" : "123456789",
"status" : "Active" (optional: default = Active),
"avatar_url" : "hashToImage" (optional)
}'
```
**Response(Correct case):**
```
{
"name":"Person Name",
"email":"example@email.com",
"phone":"123456789",
"avatar_url":null,
"id":1,
"status":"Active",
"created_at":"2026-03-11T15:47:28",
"updated_at":"2026-03-11T15:47:28"
}
```
**Response(Email duplicate):**
```
{"detail":"Email already registered"}
```


## - User (GET all):
```
curl -X GET http://data-service:9000/api/users/
```
(Show all users in the table)


## - User (GET {user_id})
```
curl -X GET http://data-service:9000/api/users/{user_id}
```
**Response(Correct case):**
```
{
"name":"Person Name",
"email":"example@email.com",
"phone":"123456789",
"avatar_url":"avatar.png",
"id":1,
"status":"Active",
"created_at":"2026-03-11T14:23:16",
"updated_at":"2026-03-11T14:23:16"
}
```
**Response(Failed case):**
```
{"detail":"User not found"}
```


## - User (PATCH):
```
(To be implemented)
```


## - User (DELETE):
```
DELETE http://data-service:9000/api/users/{user_id}
```
(Delete specific user from table)
**Response(Failed case):**
```
{"detail":"User not found"}
```
**Response(Correct case):**
```
nothing
```
</details>





<details>
<summary><h1> User Address </h1></summary>

## - User Address (POST):
```
curl -X POST "http://data-service:9000/api/users/{user_id}/address" \
-H "Content-Type: application/json" \
-d '{
  "label": "Home",
  "street": "Rua das Flores",
  "number": "123",
  "complement": "Apt 4B",
  "city": "Porto",
  "state": "Porto",
  "postal_code": "4000-001",
  "country": "Portugal"
}'
```
**Response(Correct case):**
```
{
"id":1,
"label":"Home",
"street":"Rua das Flores",
"number":"123",
"complement":"Apt 4B",
"city":"Porto",
"state":"Porto",
"postal_code":"4000-001",
"country":"Portugal",
"created_at":"2026-03-13T19:18:45",
"updated_at":"2026-03-13T19:18:45"
}
```
**Response(User have a address):**
```
{"detail":"User already have a address"}
```


## - User Address (GET)
```
curl -X GET http://data-service:9000/api/users/{user_id}/address \
```
**Response(Correct case):**
```
{
"id":1,
"label":"Home",
"street":"Rua das Flores",
"number":"123",
"complement":"Apt 4B",
"city":"Porto",
"state":"Porto",
"postal_code":"4000-001",
"country":"Portugal",
"created_at":"2026-03-13T19:18:45",
"updated_at":"2026-03-13T19:18:45"
}
```
**Response(Failed case):**
```
{"detail":"Address not found"}
```


## - User Address (PATCH):
```
(To be implemented)
```


## - User Address (DELETE):
```
curl -X DELETE http://data-service:9000/api/users/{user_id}/address
```
(Delete specific user from table)
**Response(Failed case):**
```
{"detail":"Address not found"}
```
**Response(Correct case):**
```
nothing
```

</details>





<details>
<summary><h1> Products </h1></summary>

## - Products (POST):
```
curl -X POST http://data-service:9000/api/listings/?seller_id=1 \
-H "Content-Type: application/json" \
-d '{
  "name": "Product Name",
  "slug": "product-slug",
  "description": "This is a test description",
  "price": 99.90
}'
```
**Response(Correct case):**
```
{
"id":1,
"seller_id":1,
"name":"Product Name",
"slug":"product-slug",
"description":"This is a test description",
"price":"99.90",
"status":"Active",
"created_at":"2026-03-14T16:17:26"
}
```
**Response(Slug used):**
```
{"detail":"Slug already in use"}
```


## - Products (GET) ( Search in name and description)
```
curl "http://data-service:9000/api/listings/?search=test"
```
**Response(Correct case):**
```
[
{
"id":2,
"seller_id":2,
"name":"Product Name1",
"slug":"product-slug1",
"description":"This is a test description",
"price":"99.90",
"status":"Active",
"created_at":"2026-03-14T16:23:39"
},
{
"id":1,
"seller_id":1,
"name":"Product Name",
"slug":"product-slug",
"description":"This is a test description",
"price":"99.90","status":"Active",
"created_at":"2026-03-14T16:17:26"
}
]
```
**Response(Failed case):**
```
[]
```

## - Products (GET) ( Per seller)
```
curl "http://data-service:9000/api/listings/seller/{seller_id}
```
**Response(Correct case):**
```
[
{
"id":1,
"seller_id":1,
"name":"Product Name",
"slug":"product-slug",
"description":"This is a test description",
"price":"99.90","status":"Active",
"created_at":"2026-03-14T16:17:26"
}
]
```
**Response(Failed case):**
```
[]
```



## - Products  (PATCH):
```
(To be implemented)
```


## - Products  (DELETE):
```
curl -X DELETE http://data-service:9000/api/listings/{product_id}
```
(Delete specific product from table)
**Response(Failed case):**
```
{"detail":"Product not found"}
```
**Response(Correct case):**
```
nothing
```

</details>





<details>
<summary><h1> Product Images </h1></summary>

## - Product Images (POST):
```
curl -X POST "http://data-service:9000/api/listings/{product_id}/images" \
-H "Content-Type: application/json" \
-d '{
  "image_hash": "test-hash",
  "display_order": "1"
}'
```
**Response(Correct case):**
```
{
"id":1,
"product_id":2,
"image_hash":"test-hash",
"display_order":2,
"created_at":"2026-03-14T16:34:57"
}
```
**Response(Failed case):**
```
{"detail":"Product not found"}
```


## - Product Images (GET)
```
curl "http://data-service:9000/api/listings/{product_id}/images/{image_id}"
```
**Response(Correct case):**
```
{
"id":1,
"product_id":2,
"image_hash":"test-hash",
"display_order":2,
"created_at":"2026-03-14T16:34:57"
}
```
**Response(Failed case):**
```
{"detail":"Image not found"}
```


## - Product Images (PATCH):
```
(To be implemented)
```


## - Product Images (DELETE):
```
(To be implemented)
```

</details>





<details>
<summary><h1> Orders & Order Items </h1></summary>

## - Orders (POST):
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


## - Orders  (GET)
```
curl "http://data-service:9000/api/orders/{order_id}"
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

## - Orders  (GET) Per user (all orders)
```
curl "http://data-service:9000/api/orders/buyer/{user_id}"
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
[]
```


## - Orders  (PATCH):
```
(To be implemented)
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