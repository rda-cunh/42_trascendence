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
    - [Follow](#follow)
      - [/api/follow/](#/api/follow/)
      - [/api/follow/following/{user_id}/](#/api/follow/following/{user_id}/)
      - [/api/follow/followers/{user_id}/](#/api/follow/followers/{user_id}/)
      - [/api/follow/counts/{user_id}/](#/api/follow/counts/{user_id}/)
      - [/api/follow/feed/{user_id}/](#/api/follow/feed/{user_id}/)
    - [Presence](#presence)
      - [/api/presence/ping/](#/api/presence/ping/)
      - [/api/presence/](#/api/presence/)
  - [Database APIs](#database-apis)
- [Public APIs](#public-apis)

# Internal APIs

This is the comprehensive list of APIs for internal use and non public facing. All endpoints will have their corresponding accepted methods descripted, as well as the parameters for each API method call.

## Frontend APIs

> note: currently all APIs are in a placeholder state until proper integration with database can be done

### Auth

These endpoints are related to user creation, deletion, login and logout and profile/dashboard view.

#### POST /api/auth/register/
Creates a new user account.
Body: { name, email, password }
Returns: { user_id, access_token }
Auth required: No

#### POST /api/auth/login/
Issues JWT tokens. Access token in body, refresh token set as httpOnly cookie.
Body: { email, password }
Returns: { access_token, user: { id, name, email, role } }
Auth required: No

#### POST /api/auth/logout/
Blacklists the current refresh token and clears the cookie.
Body: (none)
Returns: { detail: "Logged out." }
Auth required: Yes (Bearer header)

#### GET /api/auth/profile/
Returns the authenticated user's full profile.
Returns: { id, name, email, avatar_url, role, is_active }
Auth required: Yes (Bearer header)

#### DELETE /api/auth/profile/
Permanently deletes the authenticated user's account.
Body: { password }   [password asked for safety]
Returns: { detail: "Account deleted." }
Auth required: Yes (Bearer header)

#### PATCH /api/auth/password/
Changes the user's password.
Body: { password, new_password }
Returns: { detail: "Password updated." }
Auth required: Yes (Bearer header)

#### GET /api/auth/42/
Starts the 42 OAuth login flow by redirecting the user to the 42 authorization page.
Body: (none)
Returns: HTTP redirect to 42 OAuth authorize endpoint
Auth required: No

#### GET /api/auth/42/callback/
OAuth callback endpoint used by 42 after user authorization. Validates state, exchanges code, and redirects to frontend success/error URL.
Body: (none)
Returns: HTTP redirect to configured frontend URL with auth result
Auth required: No

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

#### /api/listings/seller/{user_id}/

- **Allowed methods**: GET

- GET: A list of products from the specific seller
  - get(self, request, user_id)
  - **return**: on success, returns the list of product information

#### /api/listings/seller/{product_id}/

- **Allowed methods**: GET

- GET: Returns a product from that seller
  - get(self, request, product_id)
  - **return**: on success, returns the product information

### Review

These endpoints are for creating and editing orders

#### /api/listings/{pruduct_id}/review/

- **Allowed methods**: GET, POST

- GET: Shows list of reviews for the product
  - get(self, request, product_id)
  - **return**: on success, returns a list with the reviews for the product

- POST: Creates a new review for product
  - post(self, request, jwt_string)
  - **return**: on success, returns the review_id and if succeeded
  

#### /api/listings/{pruduct_id}/review/{review_id}/

- **Allowed methods**: GET, PATCH

- GET: Shows a specific order information
  - get(self, request, jwt_string, order_id)
  - **return**: on success, returns a list with the order information
  
- PATCH: Make changes the review for a product
  - get(self, request, jwt_string, product_id, review_id)
  - **return**: on success, returns confirmation of the review update

### Users

This endpoint is for basic user visualization for the social aspect of the marketplace

#### /api/users/

- **Allowed methods**: GET

- GET: Show a list of users
  - get(self, request, user_id)
  - **return**: on success, returns a list of users

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

### Follow

These endpoints power the social graph: following and unfollowing users, listing followers/following, counts, and a feed of listings from followed sellers. The follower id is always taken from the JWT — the client never sends it.

#### POST /api/follow/
Follow another user.
Body: { following_id }
Returns: 201 Created (no body)
Auth required: Yes (Bearer header)

#### DELETE /api/follow/
Unfollow another user.
Body: { following_id }
Returns: 204 No Content
Auth required: Yes (Bearer header)

#### GET /api/follow/following/{user_id}/
Lists the users that `user_id` follows. Only `Active` users returned, sorted by name ascending. Optional pagination: `?limit=N` or `?limit=N&offset=M`.
Body: (none)
Returns: [ { user_id, name, avatar_url, following_since } ]
Auth required: Yes (Bearer header)

#### GET /api/follow/followers/{user_id}/
Lists the users following `user_id`. Same filtering, sorting, and pagination as `/following/`.
Body: (none)
Returns: [ { user_id, name, avatar_url, following_since } ]
Auth required: Yes (Bearer header)

#### GET /api/follow/counts/{user_id}/
Followers and following counts in a single response. Counts only include `Active` users, so they match the lengths of the list endpoints.
Body: (none)
Returns: { followers, following }
Auth required: No

#### GET /api/follow/feed/{user_id}/
Feed of active product listings posted by every user that `user_id` follows, newest first. Each item carries both the listing and the seller info so the frontend can render a card without extra requests. Optional pagination: `?limit=N` (1–100) or `?limit=N&offset=M`.
Body: (none)
Returns: [ { listing: { id, name, slug, price, created_at, image_hash }, user: { user_id, name, avatar_url, following_since } } ]
Auth required: Yes (Bearer header)

### Admin

#### /api/admin/bans/

- **Allowed methods**: GET

- GET: Show a list of banned users
  - get(self, request)
  - **return**: on success, returns a list of banned users

#### /api/admin/bans/{user_id}/

- **Allowed methods**: POST, DELETE

- POST: Bans a user 
  - post(self, request, user_id)
  - **return**: on success, returns status and a message

- DELETE: Unbans a user
  - post(self, request, user_id)
  - **return**: on success, returns the status change

#### /api/admin/manage/

- **Allowed methods**: GET

- GET: Show a list of admins
  - get(self, request)
  - **return**: on success, returns a list of current admins

#### /api/admin/bans/{user_id}/

- **Allowed methods**: POST, DELETE

- POST: create a new admin user 
  - post(self, request, user_id)
  - **return**: on success, returns status and a message

- DELETE: removes an admin user
  - post(self, request, user_id)
  - **return**: on success, returns the status change

### Presence / Online Status

This power the online/offline indicator on user profiles, seller cards and chat lists. State lives in Redis with a 60s TTL: while a user has the tab open, the frontend POST a request every 30s; if no answer arrives within 60s the key expires and the user is reported offline. There is no database table — restarts of the backend simply clear all presence and users repopulate it on the next ping.

#### POST /api/presence/ping/
Refreshes the caller online status (resets the 60s TTL in Redis). The user id is taken from the JWT.
Body: (none)
Returns: 204 No Content
Auth required: Yes (Bearer header)

#### GET /api/presence/
Bulk online-status lookup for a list of users. Public. Pass the ids as a comma-separated query string. Maximum 200 ids per request.
Query: `?ids=1,2,3`
Body: (none)
Returns: { "1": true, "2": false, "3": true }
Auth required: No

## Public APIs

#### /api/public/users/

- **Allowed methods**: GET

- GET: Show a list of users
  - get(self, request, user_id)
  - **return**: on success, returns a list of users

#### /api/public/users/{id}/

- **Allowed methods**: GET

- GET: Show the individual profile of a user and their products
  - get(self, request, user_id)
  - **return**: on success, returns basic user information and a list of their owned products

#### /api/listings/

- **Allowed methods**: GET, POST 

> note: not sure if the sorting should be done on frontend level or backend level in this case

- GET: Show a given number of items and sort type
  - get(self, request, list_size, sort_type)
  - **return**: on success, returns a list of products

#### /api/listings/{id}/

- **Allowed methods**: GET, PATCH, DELETE

- GET: returns the information of a specific product
  - get(self, request, product_id)
  - **return**: on success, returns the full product information
