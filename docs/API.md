# API Documentation

Here is a complete list of APIs used in this project, separated by cateories in the following index.

### Contents

- [Internal APIs](#internal-apis)
  - [Frontend APIs](#frontend-apis)
    - [Product listings](#product-listings)
      - [/api/listings](#/api/listings/)
      - [/api/listings/{id}](#/api/listings/{id}/)
    - [Users](#users)
      - [/api/users](#/api/users/)
      - [/api/users/{id}](#/api/users/{id}/)
    - [Orders](#orders)
      - [/api/orders](#/api/orders/)
      - [/api/orders/{id}](#/api/orders/{id}/)
  - [Database APIs](#database-apis)
- [Public APIs](#public-apis)

# Internal APIs

This is the comprehensive list of APIs for internal use and non public facing. All endpoints will have their corresponding accepted methods descripted, as well as the parameters for each API method call.

## Frontend APIs

> note: currently all APIs are in a placeholder state until proper integration with database can be done

### Auth

These endpoints are related to user creation, deletion, login and logout and profile/dashboard view.

#### /api/auth/register/

- **Allowed methods**: POST, DELETE

- POST: Creation of new user account
  - post(self, request, username, email, password)
  - **return**: on success, JWT and user_id are returned.

- DELETE: Deletion of an existing user account
  - delete(self, request, username, password, jwt_string)
  - **return**: on success, confirmation message is sent.

#### /api/auth/login/

- **Allowed methods**: POST, DELETE

- POST: create a new login session
  - post(self, request, email, password)
  - **return**: on success, JWT is returned.

- DELETE: quits current active session
  - delete(self, request, jwt_string)
  - **return**: on success, confirmation message is sent.

#### /api/auth/profile

- **Allowed methods**: GET 

- GET: Show current logged user's profile
  - get(self, request, jwt_string)
  - **return**: on success, return full profile detail.

### Listing

These endpoints are related to the creation, deletion and editing of product listings.

#### /api/listings/

- **Allowed methods**: GET, POST 

> note: not sure if the sorting should be done on frontend level or backend level in this case

- GET: Show a given number of items and sort type
  - get(self, request, list_size, sort_type)
  - **return**: on success, returns a list of products

- POST: Creates a new product listing produto, enviando título, código, preço, etc.
  - post(self, request, jwt_string, product_title, description, code, price, assets)
  - **return**: on success, returns new product id

#### /api/listings/{id}/

- **Allowed methods**: GET, PATCH, DELETE

- GET: returns the information of a specific product
  - get(self, request, product_id)
  - **return**: on success, returns the full product information

- PATCH: Updates the information of a product listing. 
  - patch(self, request, jwt_string, product_title, description, code, price, assets)
  - **return**: on success, returns a sucessfull update message

- DELETE: Deletes a product listing.
  - delete(self, request, jwt_string, product_id)
  - **return**: on success, returns a deletion confirmation

### Users

This endpoint is for basic user visualization for the social aspect of the marketplace

#### /api/users/{id}/

- **Allowed methods**: GET

- GET: Show the individual profile of a user and their products
  - get(self, request, user_id)
  - **return**: on success, returns basic user information and a list of their owned products

### Orders

These endpoints are for creating and editing orders

#### /api/orders/

- **Allowed methods**: GET, POST

- GET: Shows list of past orders
  - get(self, request, jwt_string)
  - **return**: on success, returns a list of past orders by the user

- POST: Creates a new order for delivery
  - post(self, request, jwt_string, billing_info)
  - **return**: on success, returns confirmation of order being processed by stripe

#### /api/orders/{id}/

- **Allowed methods**: GET, PATCH

- GET: Shows a specific order information
  - get(self, request, jwt_string, order_id)
  - **return**: on success, returns a list with the order information
  
- PATCH: Changes the status of an order (cancelation, info change, etc)
  - get(self, request, jwt_string, order_id, status_id)
  - **return**: on success, returns confirmation of the status update

## Database APIs

## Public APIs
