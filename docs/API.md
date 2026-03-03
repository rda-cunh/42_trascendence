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

## Frontend APIs

### Listing

#### /api/listings

GET /api/listings -> lista todos os produtos (pode usar query params para filtro/paginação).
POST /api/listings -> cria um novo produto, enviando título, código, preço, etc.

#### /api/listings/{id}/

GET /api/listings/{id} -> pega um produto específico.
PATCH /api/listings/{id} -> atualiza os dados de um produto.
DELETE /api/listings/{id} -> deleta o produto.

### Users

#### /api/users/

#### /api/users/{id}/

### Orders

#### /api/orders/

#### /api/orders/{id}/

## Database APIs

## Public APIs
