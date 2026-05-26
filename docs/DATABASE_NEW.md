# Database and Data Service Documentation

## 1. Overview

This project implements a **marketplace** using MySQL as the database engine and FastAPI as the service layer. The database stores users, products, orders, messages, notifications, and other core relationships required by the platform. The data service exposes ready-to-use endpoints for the backend, separating data access logic from application logic. [file:2][web:3][web:9]

The structure was designed to support the typical features of a marketplace: authentication, product catalog, reviews, purchases, user conversations, following profiles, and notifications. Using raw SQL without an ORM makes the application closer to the database layer and helps demonstrate a clear understanding of queries, constraints, and relationships. [file:2][web:9]

## 2. Architecture

### Database
The database was built with **MySQL/InnoDB**, supporting primary keys, foreign keys, indexes, and integrity rules. The tables use appropriate data types such as `DECIMAL` for prices, `ENUM` for statuses, and `TIMESTAMP` for temporal tracking. MySQL foreign keys help keep related data consistent across tables. [file:2][web:11]

### Data service
The service was built with **FastAPI without an ORM**, which means database operations are executed directly with SQL. This allows fine control over inserts, updates, joins, and filters, and it is a good academic choice because it keeps the logic transparent. FastAPI is designed to build APIs efficiently, and it does not require an ORM. [file:1][file:2][web:3][web:9]

## 3. Relational Model

The main tables are:

- `users`
- `products`
- `product_images`
- `orders`
- `order_items`
- `product_reviews`
- `conversations`
- `messages`
- `follows`
- `notifications` [file:2]

### Main relationships
- A **user** can sell multiple **products**. [file:2]
- A **product** can have multiple **product_images**. [file:2]
- An **order** belongs to a buyer and contains multiple **order_items**. [file:2]
- A **product_review** is linked to a product, a user, and optionally to an order item. [file:2]
- A **conversation** connects buyer, seller, and product. [file:2]
- A **message** belongs to a conversation. [file:2]
- A **follow** links one user to another. [file:2]
- A **notification** can reference a user, a product, and an actor. [file:2]

## 4. Database Tables

### users
Stores marketplace user data. It includes name, email, password hash, phone, role, status, avatar, creation date, and update date. The email is unique, and the user can have the role `User` or `Admin`. [file:2]

### products
Stores the products listed in the marketplace. Each product belongs to a seller (`seller_id`) and includes name, slug, description, price, images in JSON format, status, average rating, and review count. There are indexes on `seller_id` and `status`, which help with listing and filtering. [file:2]

### product_images
Auxiliary table for images associated with products. Each image belongs to a product and includes a `display_order` field to define the image order. [file:2]

### orders
Represents an order placed by a buyer. It stores a unique code, order status, subtotal, total, notes, and timestamps. [file:2]

### order_items
Each row represents one item inside an order. It includes a reference to the order, the product, the seller, the product name, the price, the quantity, and the subtotal. The `product_id` can become `NULL` if the product is removed, preserving order history. [file:2]

### product_reviews
Stores reviews left for products. Each review includes a rating from 1 to 5, title, body, status, and links to the product and the user. A constraint ensures the rating stays within the valid range. [file:2]

### conversations
Represents a conversation between buyer and seller about a product. It stores the last message and the last activity timestamp, which helps display recent chats. [file:2]

### messages
Stores the messages sent inside a conversation. Each message belongs to a conversation and to a sender, with a field for read tracking. [file:2]

### follows
Represents the relationship where one user follows another. The composite primary key prevents duplicates, and a check constraint prevents self-following. [file:2]

### notifications
Stores notifications sent to users. It can include the recipient user, the actor that triggered the action, the notification type, the related product, and a JSON payload for extra information. [file:2]

## 5. Integrity Rules

The database applies several important rules:

- **Primary keys** uniquely identify each record.
- **Foreign keys** preserve valid relationships between tables.
- **Unique keys** are used for fields such as email, slug, and code.
- **Check constraints** validate values such as ratings between 1 and 5.
- **Cascade delete** is used where it makes sense, such as deleting product images when a product is deleted.
- **Soft delete** is used for important entities like `products` and `product_reviews`, preserving history. [file:2][web:11]

## 6. Data Service Endpoints

### Authentication and Users

| Method | Endpoint | Function | Main parameters | Response |
|---|---|---|---|---|
| GET | `/api/users/{user_id}/` | Shows a public profile with the user's products | `user_id`, optional `page` | Name, email, avatar, creation date, pages, and listings. [file:13] |
| POST | `/api/auth/register/` | Registers a new user | registration data | `id`, `status`, `role`, `created_at`, `updated_at`. [file:13] |
| DELETE | `/api/auth/register/{user_id}/` | Deletes the user record | `user_id` | No explicit return defined. [file:13] |
| GET | `/api/auth/by-email/` | Finds a user by email | `email` | `id`, `status`, `role`, `created_at`, `updated_at`. [file:13] |
| POST | `/api/auth/login/` | Logs in with email and password | `email`, `password` | `id`, `status`, `role`, `created_at`, `updated_at`. [file:13] |
| GET | `/api/auth/profile/{user_id}` | Shows the private profile of the logged-in user | `user_id`, optional `page` | Name, email, and listings. [file:13] |
| PATCH | `/api/auth/profile/{user_id}/` | Updates profile information | `name`, `email`, `phone`, `avatar_url` | `id`, `status`, `role`, `created_at`, `updated_at`. [file:13] |
| PATCH | `/api/auth/profile/password/{user_id}/` | Updates password | new password | `id`, `status`, `role`, `created_at`, `updated_at`. [file:13] |
| DELETE | `/api/auth/profile/{user_id}/` | Soft deletes the user | `user_id` | No explicit return defined. [file:13] |

### Administration

| Method | Endpoint | Function | Response |
|---|---|---|---|
| GET | `/api/admin/bans/` | Lists banned users | Basic user data. [file:13] |
| POST | `/api/admin/bans/{user_id}/` | Bans a user | Basic user data. [file:13] |
| DELETE | `/api/admin/bans/{user_id}/` | Unbans a user | Basic user data. [file:13] |
| GET | `/api/admin/manage/` | Lists admins | Basic user data. [file:13] |
| POST | `/api/admin/manage/{user_id}/` | Promotes a user to admin | Basic user data. [file:13] |
| DELETE | `/api/admin/manage/{user_id}/` | Removes admin role and returns the user to normal | Basic user data. [file:13] |
| GET | `/api/admin/dashboard/` | Shows system metrics | Revenue, users, orders, active listings, trends, and months. [file:13] |

### Products and Reviews

| Method | Endpoint | Function | Parameters | Response |
|---|---|---|---|---|
| GET | `/api/listings/images/` | Lists images used by active products | — | List of images with `id`, `product_id`, `image_hash`, `display_order`, `created_at`. [file:13] |
| POST | `/api/listings/` | Creates a product | `user_id`, `name`, `description`, `price`, `images` | Created product with seller information. [file:13] |
| GET | `/api/listings/` | Lists products with filters | `search`, `page`, `status`, `seller_id` | List of products with seller information. [file:13] |
| GET | `/api/listings/{product_id}/` | Shows a specific product | `product_id` | Full product data with seller information. [file:13] |
| PATCH | `/api/listings/{product_id}/` | Updates a product | `user_id`, `name`, `description`, `price`, `images` | Updated product. [file:13] |
| DELETE | `/api/listings/{product_id}/` | Soft deletes a product | `product_id` | No explicit return defined. [file:13] |
| POST | `/api/listings/{product_id}/reviews/` | Creates a review | `reviewer_id`, `rating`, `title`, `body` | Review created with author information. [file:13] |
| GET | `/api/listings/{product_id}/reviews` | Lists reviews for a product | optional `page` | List of reviews. [file:13] |
| PATCH | `/api/listings/{product_id}/reviews/{review_id}/` | Updates a review | `rating`, `title`, `body` | Updated review. [file:13] |
| DELETE | `/api/listings/{product_id}/reviews/{review_id}/` | Soft deletes a review | `review_id` | No explicit return defined. [file:13] |

### Orders

| Method | Endpoint | Function | Parameters | Response |
|---|---|---|---|---|
| POST | `/api/orders/` | Creates a new order | `user_id`, `items` | Order with included items. [file:1][file:13] |
| GET | `/api/orders/{order_id}/` | Shows a specific order | `order_id` | Order with items. [file:1][file:13] |
| GET | `/api/orders/buyer/{buyer_id}/` | Lists orders for a user | `buyer_id` | List of orders with items. [file:1][file:13] |
| PATCH | `/api/orders/{order_id}/` | Updates the order status | `status` | Updated order. [file:1][file:13] |

### Chat

| Method | Endpoint | Function | Response |
|---|---|---|---|
| GET | `/api/chat/conversations/by-id/{conv_id}/` | Returns a chat by its ID | Full conversation object with listing, buyer, seller, and optional message history. [file:13] |
| POST | `/api/chat/conversations/` | Creates a conversation or returns the existing one if it already exists | Full conversation object with listing, buyer, seller, and optional message history. [file:13] |
| GET | `/api/chat/conversations/{user_id}/` | Lists all chats for a user | List of conversation objects with listing, buyer, seller, and optional history. [file:13] |
| GET | `/api/chat/conversations/{conv_id}/messages/` | Loads the message history for a specific chat | List of messages with sender, content, read time, and creation time. [file:13] |
| POST | `/api/chat/conversations/{conv_id}/messages/` | Sends a message to a chat | Created message with sender, content, read time, and creation time. [file:13] |

### Notifications

| Method | Endpoint | Function | Parameters | Response |
|---|---|---|---|---|
| GET | `/api/notifications/{user_id}/` | Lists a user's notifications | `limit`, `offset`, `unread_only` | List of notifications with actor and product details. [file:13] |
| GET | `/api/notifications/{user_id}/unread-count/` | Returns the number of unread notifications | — | `{ "num": int }`. [file:13] |
| POST | `/api/notifications/{user_id}/read/` | Marks selected notifications as read | `ids` | `{ "marked": int }`. [file:13] |
| POST | `/api/notifications/{user_id}/read-all/` | Marks all notifications as read | — | `{ "marked": int }`. [file:13] |
| POST | `/api/notifications/fanout/new-listings/` | Sends notifications to followers about a new listing | `seller_id`, `product_id` | `{ "receiver_ids": list[int], "inserted": int }`. [file:13] |

### Follows

| Method | Endpoint | Function | Parameters | Response |
|---|---|---|---|---|
| POST | `/api/follow/add/` | Follows another user | `user_id`, `following_id` | No explicit return defined. [file:13] |
| DELETE | `/api/follow/remove/` | Unfollows another user | follow data | No explicit return defined. [file:13] |
| GET | `/api/follow/following/{user_id}/` | Lists who a user is following | `user_id` | List with `user_id`, `name`, `avatar_url`, and `following_since`. [file:13] |
| GET | `/api/follow/followers/{user_id}/` | Lists who follows a user | `user_id` | List with `user_id`, `name`, `avatar_url`, and `following_since`. [file:13] |
| GET | `/api/follow/followers-count/{user_id}` | Returns the follower count | `user_id` | `{ "num": int }`. [file:13] |
| GET | `/api/follow/following-count/{user_id}` | Returns the following count | `user_id` | `{ "num": int }`. [file:13] |
| GET | `/api/follow/feed/{user_id}/` | Returns a feed of listings from followed users | `user_id` | List of listing and user info objects. [file:13] |

## 7. Functional Flow

A typical flow in the system can be described as follows:

1. A user registers and logs in. [file:13]
2. The user creates a product with images. [file:13]
3. Another user views the product and may start a conversation. [file:13]
4. If a purchase happens, an order is created with multiple items. [file:13]
5. After the purchase, the user can leave a review. [file:13]
6. The system can generate notifications for new messages, follows, or other interactions. [file:13]

This flow is useful for presentation because it shows how the tables and endpoints work together to support the marketplace. [file:13][file:2]

## 8. Presentation Notes

The main advantage of this implementation is that it demonstrates **relational modeling, referential integrity, and API construction** without relying on an ORM. It is also easy to explain because each table has a clear purpose and each endpoint responds to a real user need. [file:2][web:9]

For your presentation, I recommend organizing the slides in this order:
1. Problem and objective of the marketplace.
2. Solution architecture.
3. Database model.
4. Table explanations.
5. Main endpoints.
6. System usage flow. [file:13][file:2]