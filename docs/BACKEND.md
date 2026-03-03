# Backend Implementation

## Description

The Backend framework that will be used is Djange with DRF for the RESTful API. So the language of choice will be python, of course.
The choice for Django is with the following reason:
- Fast and Easy implementation of CRUD, Auth, Permission and Admin Tools.
- Great availability of Tools and Documentation. As well as simplicity of the language used, Python in this case.
- Migrations and ORM
- Great compatibility with Marketplace-style domains (users, listings, orders, payment stubs, moderation and reportiong)

## Technologies used

| Name | Description |
| --- | --- |
| Django | Open-Source Backend Framework in Python. Follows model-template-views architectural pattern |
| DRF | Django Rest Framework for Web API building and OAuth support |
| Python | Language used to work with the previous frameworks |

### Communication Path

The Idea of the communication path is that the browser only talks to NGINX. From there, NGINX servers the frontend and proxies API/ WebSocket to the Backend. and only the Backend talks to the database.

```code
[Browser]
   |
   | HTTPS (443)
   v
[NGINX Reverse Proxy]
   |---- serves ----> [Frontend static files]  (/, /assets/*)
   |
   |---- proxies (NGINX?)----> [Backend API]           (/api/*)
   |
   |---- proxies (NGINX?) ----> [Backend WS]            (/ws/*)  (optional)
                          |
                          | SQL (5432/3306)
                          v
                       [Database]
```

The key idea here is the following:
- `/` -> front build (SPA)
- `/api/` -> backend REST API
- `/ws/` -> backend websocket endpoint

By keepig the NGINX as the single public entrypoint into our infrastructure, being all connected into the same private network and domain, we can avoid most CORS (Cross-Origin Resource Sharing) headaches by keeping the frontend + API under one origin.

### Contract Definition

> Note: this is only a placeholder for visualizing the scope of this project

- **Domain Entities**: to be decided
- **Routes**: placeholder
  - TLS passthrough 
  - Static frontend served by NGINX
  - `/api` proxies to backend
  - `/ws` proxied with updaraded headers
  - DB only accessile inside docker network
- **Auth Model**: JWT
- **Role Model**: seller/buyer with Admins 
- **Error Format**: JSON (to be decided with ecarvalh)

### Model Domain

- **User**: user_id, email/login, pass hash/OAuth id, created_at
- **Profile**: display_name, avatar, order_history
- **Product/Listings**:product_id, owner_id, title, description, price, status
- **Order**: product_id, buyer_id, status, total
- **OrderItem**: order_id, product_id, quantity, unit_price 
- **PaymentIntent**: order_id, status, stripe_response
- **Review**: user_id, product_id, rating, message
- **Message**: user_id, user_id, message

## API Communication

API communication workflow was defined for ease of parallel workflows and to simplify integration of different parts of the project. We decided to implement a RESTful API (REST - Representation state Transfer; API - Application Programming Interface) for a clear and universal communication design.

For the overall design of how the APIs will work, here is a breakdown of the most important parts:

> Note: May need a more thorough API breakdown, for now this is a general idea 

### Auth

| Method | Endpoint | Purpose | Request Body | Success Response |
| --- | --- | --- | --- | --- |
| POST | /api/auth/register | Create New Account | `{"user": "name", "email": "...", "passhash":"..."}` | `{"message": "User Create", "user_id": 101}` |
| POST | /api/auth/login | Get Access Token | `{"email": "...", "pass": "..."}` | `{"token": "JWT_STRING"}` |
| POST | /api/auth/logout | Close Session | `Header: Authorization: Bearer JWT_STRING` | `{"Message": "Logged Out"}` |
| GET  | /api/user/profile | Get user info | `Header: Autorization: Bearer JWT_STRING` | `{"username": "dev42", "credits": 500, "avatar": "url"}` |

### Listings

| Method | Endpoint | Purpose | Request Body | Success Response |
| --- | --- | --- | --- | --- |
| GET | /api/listings?query=&page= | Get list of products | `?category=example&sort=top` | `[{"id": 1, "title": "example", "price": 10} ...]` |
| POST | /api/listings | Create new product listing | `{"title": "...", "code": "...", "price": 5}` | `{"status": "Uploaded", "product_id": 210}` |
| GET | /api/listings/{id} | Get Specific product | `ID in URL` | `{"title": "...", "code": "...", "owner": "Erik"}` |
| PATCH | /api/listings/{id} | Edit product info | `{"user_id": "...", "product_id": "...", "code": "...", "price": "..."}` | `{"status": "Updated"}` |
| DELETE | /api/listings/{id} | Eliminate product listing | `{"user_id": "...", "product_id": "..."` | `{"status": "deleted"}` |

### Orders

| Method | Endpoint | Purpose | Request Body | Success Response |
| --- | --- | --- | --- | --- |
| POST | /api/orders | Create a new checkout order | `{"items":[{"listing_id":210,"quantity":2},{"listing_id":2,"quantity":1}],"shipping_address":{"name":"John Doe","line1":"Rua Exemplo 12","city":"Porto","postal_code":"4000-000","country":"PT"}}` | `{"status":"created","order_id":5501,"total":62.5,"currency":"EUR"}` |
| GET | /api/orders | List my orders | `Header: Authorization: Bearer JWT_STRING; Optional params: ?page=1&status=created` | `{"page":1,"page_size":10,"total":3,"items":[{"order_id":5501,"status":"created","total":62.5,"currency":"EUR","created_at":"2026-02-25T14:12:30Z"},{"order_id":5498,"status":"shipped","total":25.0,"currency":"EUR","created_at":"2026-02-20T09:05:11Z"}]}` |
| GET | /api/orders/{id} | Get order details | `ID in URL` | `{"order_id":5501,"status":"created","currency":"EUR","total":62.5,"items":[{"listing_id":210,"title":"Mechanical Keyboard","unit_price":25.0,"quantity":2},{"listing_id":2,"title":"Keycap Set","unit_price":12.5,"quantity":1}]` |
| PATCH | /api/orders/{id} | Update order (status transitions) | `Header: Authorization: Bearer JWT_STRING; Body: {"status":"cancelled"}` | `{"status":"Updated","order_id":5501,"new_status":"cancelled"}` |


### Conventions

Will always return a structured JSON:
- **Success**: {"data": ... , "meta": ...}
- **Error**: {"error": {"code": "..." , "message": "..." , "details": ... }}

### Data Flow

> Note: this is only a placeholder for visualizing the scope of this project

The overall dataflow could be streamlined as such:

```bash
Frontend (browser) → HTTP request (GET/POST/…) → NGINX → Django/DRF endpoint → Django ORM → Database → Django returns JSON
```

## DB Schema + Migrations

> Note: this is only a placeholder for visualizing the scope of this project

- Define with Lmaes the tables + indexes (especially important for listing search)
- Use Django built-in migration tools

## Backend Layers

> Note: this is only a placeholder for visualizing the scope of this project

As it is important to keep separations, even for small projects, the proposed layers are the following:
- **handlers/controllers** (http specifics)
- **service layer** (business rules)
- **repository/data access** (DB queries)
- **Models/Schemas** (DTOs + Validation)

## NGINX Reverse Proxy

> Note: this is only a placeholder for visualizing the scope of this project

- Path rewriting (/api/ prefix)
- Forwarded headers
- Websocket upgrade headers

## API + tests

- Django: DRF Schema Generation Tools
- Auth Flow
- Permission (e.g. only owner can edit product)
- order status transitions
- basic DB constraint tests

# Refences

- [42Network APIs](https://api.intra.42.fr/apidoc)
- [Django Official Documentation](https://docs.djangoproject.com/en/6.0/)
- [Django in 1 Hour](https://www.youtube.com/watch?v=rHux0gMZ3Eg)
- [Django Crash Course](https://www.youtube.com/watch?v=u1GnZfDw5LU)
- [DRF Official Page](https://www.django-rest-framework.org/)
- [What is Django Rest Framework (in Portuguese)](https://pythonacademy.com.br/blog/o-que-e-o-django-rest-framework)
- [Build a Backend Rest API with Django & Python](https://www.youtube.com/watch?v=mNwAyMmGKoI&list=PL8GFhcuc_fW4cxdkRtWIlln1DQ3CZwQen)
- [Designing Microservices](https://www.geeksforgeeks.org/system-design/microservices/)
