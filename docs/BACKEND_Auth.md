# Backend Authentication

## Description

This document explains how authentication is currently implemented in the backend gateway service (`srcs/backend/app`).
It is intended for all teammates (frontend, backend, and data) and for project evaluation/defense preparation.

The goal is to describe the **current implementation as-is** (not an idealized version):
- how auth requests move through the system,
- how JWT and 42 OAuth are issued/validated,
- which endpoints exist,
- where security protections exist today,
- and where technical debt / ambiguities still exist.

---

## Contents

- [Authentication Architecture Overview](#authentication-architecture-overview)
- [Authentication Methods Used](#authentication-methods-used)
- [Endpoint Documentation](#endpoint-documentation)
- [OAuth Flow Explanation (42 OAuth)](#oauth-flow-explanation-42-oauth)
- [Security Considerations](#security-considerations)
- [Internal Backend Logic](#internal-backend-logic)
- [Integration Notes for Frontend/Data Teams](#integration-notes-for-frontenddata-teams)
- [Evaluation Notes (Defense)](#evaluation-notes-defense)
- [Possible Improvements](#possible-improvements)

---

## Authentication Architecture Overview

### High-level architecture

Authentication is implemented in the **backend API gateway** (Django + DRF + SimpleJWT), but user account source-of-truth is delegated to a separate **data-service**.

```text
[Frontend]
   |
   | 1) Calls /api/auth/* (via gateway)
   v
[Backend Gateway - Django/DRF]
   |  - validates payloads (serializers)
   |  - manages JWT creation/refresh/blacklist
   |  - manages OAuth 42 redirect + callback
   |  - stores local "shadow users" for JWT compatibility
   |
   | 2) Proxies identity/profile operations with X-Internal-Token
   v
[Data-Service]
   |  - verifies credentials
   |  - creates user/profile
   |  - updates/deletes profile
   v
[Database(s)]
```

### Main authentication flows

1. **Email/password login flow**
   - Frontend sends credentials to `/api/auth/login/`.
   - Gateway validates input, forwards to data-service `/auth/login/`.
   - If valid, gateway creates/updates local shadow user and issues JWTs.
   - Access token returned in JSON body; refresh token in HttpOnly cookie.

2. **Refresh flow**
   - Frontend calls `/api/auth/refresh/` with `credentials: "include"`.
   - Gateway reads refresh token cookie, validates it, rotates it, blacklists previous token.
   - Returns new access token and sets a new refresh cookie.

3. **Logout flow**
   - Frontend calls `/api/auth/logout/` with Bearer access token + cookies.
   - Gateway blacklists current refresh token (if present) and deletes refresh cookie.

4. **42 OAuth flow**
   - Frontend triggers `/api/auth/42/` redirect.
   - Gateway generates state cookie and redirects to 42 authorize URL.
   - Callback `/api/auth/42/callback/` validates state, exchanges code, fetches profile.
   - Gateway attempts registration in data-service and then issues JWT pair.

### Relationship between frontend, backend, OAuth provider, JWT, protected endpoints

- **Frontend**: keeps short-lived access token (typically in memory) and sends it in `Authorization: Bearer ...`.
- **Backend gateway**: verifies JWT on protected routes (`IsAuthenticated`) and maps `request.user` to local shadow-user ID.
- **OAuth provider (42 intra)**: only used during OAuth login bootstrap; not used for each API request.
- **Refresh token**: stored in secure HttpOnly cookie (`refresh_token`) and used only on `/api/auth/refresh/` (and logout cleanup).
- **Protected endpoints**: rely on JWT authentication class globally, with route-level overrides using `AllowAny` for public auth endpoints.

---

## Authentication Methods Used

### JWT authentication

- Implemented with `rest_framework_simplejwt`.
- Global DRF authentication class is JWT (`JWTAuthentication`).
- Access token lifetime: **30 minutes**.
- Custom claims are inserted into refresh + access tokens (`external_user_id`, `name`, `email`, `role`).

### OAuth (42 OAuth)

- Authorization code flow using:
  - `/api/auth/42/` (redirect to provider)
  - `/api/auth/42/callback/` (handle code)
- State nonce is stored in cookie (`oauth42_state`) for CSRF protection during callback.
- On successful callback, backend issues same JWT/cookie model as regular login.

### Session / token lifecycle

- There is **no server-side browser session** used for user auth.
- Auth identity is represented by JWT pair:
  - access token in response body,
  - refresh token in HttpOnly cookie with `Secure` and `SameSite=Strict`.
- Refresh token cookie path is restricted to `/api/auth/`.

### Refresh token strategy

- Rotating refresh pattern is implemented in `auth_refresh`:
  - validate current refresh token,
  - mint a new refresh token,
  - return new access token,
  - blacklist old refresh token.
- Blacklist support is enabled (`token_blacklist` app installed).

### Logout / invalidation behavior

- Logout reads refresh token cookie and blacklists it if possible.
- Cookie is deleted even if token parsing fails.
- Access tokens are not explicitly revoked server-side (they naturally expire).

---

## Endpoint Documentation

> Base prefix: all routes below are under `/api/`.

| Method | Endpoint | Auth required | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register/` | No | Validate payload and proxy registration to data-service. |
| POST | `/auth/login/` | No | Credential login via data-service, then issue JWT/cookie. |
| POST | `/auth/logout/` | Yes (Bearer) | Blacklist refresh token and clear cookie. |
| POST | `/auth/refresh/` | No (cookie required) | Rotate refresh token and issue new access token. |
| GET | `/auth/profile/` | Yes (Bearer) | Fetch authenticated user profile from data-service. |
| PATCH | `/auth/profile/` | Yes (Bearer) | Patch authenticated profile via data-service. |
| DELETE | `/auth/profile/` | Yes (Bearer) | Delete authenticated account via data-service. |
| PATCH | `/auth/password/` | Yes (Bearer) | Change password via data-service. |
| GET | `/auth/42/` | No | Start 42 OAuth redirect. |
| GET | `/auth/42/callback/` | No | Handle OAuth callback, issue JWT/cookie, redirect frontend. |

### Examples

#### 1) Login

```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "supersecret123"
}
```

Success response:

```json
{
  "access": "<jwt_access_token>",
  "user": {
    "id": 123,
    "name": "User",
    "email": "user@example.com",
    "role": "user"
  }
}
```

Also sets:
- `Set-Cookie: refresh_token=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/`

#### 2) Refresh

```http
POST /api/auth/refresh/
Cookie: refresh_token=<jwt_refresh>
```

Success response:

```json
{ "access": "<new_access_token>" }
```

#### 3) Profile read

```http
GET /api/auth/profile/
Authorization: Bearer <access>
```

Response is proxied directly from data-service.

---

## OAuth Flow Explanation (42 OAuth)

### Step-by-step

1. Client opens `/api/auth/42/`.
2. Backend creates random `state` and stores it in `oauth42_state` cookie (5 min, HttpOnly, Secure, SameSite=Lax).
3. Backend redirects to `https://api.intra.42.fr/oauth/authorize` with `client_id`, `redirect_uri`, `response_type=code`, `scope=public`, and `state`.
4. 42 redirects to `/api/auth/42/callback/?code=...&state=...`.
5. Backend compares callback state vs cookie state.
   - If mismatch/missing: failure redirect with `error=invalid_oauth_state`.
6. Backend exchanges `code` for provider token at `https://api.intra.42.fr/oauth/token`.
7. Backend fetches 42 profile at `https://api.intra.42.fr/v2/me`.
8. Backend builds `user_data_42` and attempts `POST /auth/register/` on data-service.
9. If registration succeeds (`201`), user record from data-service is used to build local shadow user.
10. JWT refresh/access are generated and frontend is redirected to success URL with access token + user JSON in query params.

### Redirect flow

- Success redirect base URL from `OAUTH_SUCCESS_REDIRECT` (default `https://127.0.0.1/login/success`).
- Failure redirect base URL from `OAUTH_FAILURE_REDIRECT` (default `https://127.0.0.1/login/error`).
- Errors are encoded in query string (`?error=...`).

### State parameter and CSRF protection

- OAuth state nonce exists and is validated.
- Cookie scoped at `/api/auth/42/` and deleted after callback handling.
- This protects callback endpoint against cross-site forgery/replay within nonce lifetime.

### Token exchange process

- Code exchange uses client secret on backend side (never frontend).
- Provider access token is used immediately to fetch profile and then discarded.
- App-level JWTs are independent from provider token.

### User creation / shadow-user logic

- A local Django user is required so SimpleJWT can mint tokens.
- Gateway creates a **shadow user** where PK equals data-service user id.
- Password is set unusable for newly created shadow users.
- For OAuth specifically, `external_user_id` claim is set to 42 profile id, while local `user_id` claim maps to shadow/data-service id.

> Important ambiguity: current OAuth code handles existing-email registration as an error (`409 -> email_already_registered`) instead of linking existing accounts.

---

## Security Considerations

### CSRF protection

- Django CSRF middleware is enabled globally.
- OAuth callback has explicit state validation and dedicated state cookie.
- Refresh endpoint relies on HttpOnly cookie; no explicit CSRF token validation is implemented at the endpoint level in this file.

### Token validation

- JWT access validation is handled by DRF + SimpleJWT.
- Refresh tokens are parsed/validated with `RefreshToken(...)` and old refresh token is blacklisted after rotation.
- Blacklist app is enabled in installed apps.

### Error handling

- Proxy helper returns upstream response bodies/statuses where possible.
- Network errors to data-service return `502` with structured error.
- OAuth callback provides deterministic redirect error codes for common failures.

### Rate limiting

- No DRF throttling configuration found in current settings.
- No explicit login/OAuth abuse controls found in current auth views.

### Cookie / security settings

- Refresh cookie is `HttpOnly`, `Secure`, `SameSite=Strict`, path-limited.
- OAuth state cookie is `HttpOnly`, `Secure`, `SameSite=Lax`, short TTL (300s).
- `DEBUG=True` currently in settings (important for production hardening discussion).

---

## Internal Backend Logic

### Core files and responsibilities

| File | Responsibility |
| --- | --- |
| `srcs/backend/app/api/views.py` | Auth endpoints, OAuth flow, token issuance/rotation, proxy integration, shadow-user sync. |
| `srcs/backend/app/api/serializers.py` | Input validation for register/login/profile/password/delete. |
| `srcs/backend/app/api/urls.py` | Route exposure for all auth endpoints. |
| `srcs/backend/app/backend/settings.py` | JWT/DRF/cookie/CORS/auth provider configuration. |

### Key functions/classes

- `proxy_request(...)`
  - Generic forwarding helper to data-service.
  - Adds internal service token header.

- `get_or_create_shadow_user(user_data)`
  - Ensures local Django user exists with same ID as external user.
  - Syncs selected fields and keeps account active.

- `auth_login`
  - Validates credentials via serializer.
  - Delegates credential verification to data-service.
  - Generates access token + refresh cookie.

- `auth_refresh`
  - Reads refresh cookie.
  - Issues new access + refresh pair.
  - Blacklists old refresh token.

- `auth_42_redirect` / `auth_42_callback`
  - Full 42 OAuth handshake and JWT issuance.

### How users are created/retrieved/authenticated

1. **Created in data-service** (`/auth/register/` proxy).
2. **Mirrored in gateway as shadow user** when first login/OAuth happens.
3. **Authenticated in gateway via JWT** (`request.user` points to shadow user id).
4. **Profile data retrieved from data-service** using `request.user.id` as external identifier.

---

## Integration Notes for Frontend/Data Teams

### Frontend integration checklist

- Store access token client-side (prefer memory storage).
- Send `Authorization: Bearer <access>` for protected endpoints.
- Use `credentials: "include"` for:
  - `/api/auth/login/` (receive refresh cookie),
  - `/api/auth/refresh/` (send refresh cookie),
  - `/api/auth/logout/` (send + clear refresh cookie),
  - OAuth callback follow-up requests where cookie participation matters.
- Implement auto-refresh on `401` from protected endpoints.

### Expected token usage pattern

```text
Login/OAuth success -> access token in response
Use access token for API calls
If access expires -> call /api/auth/refresh/ with cookie
Receive new access token (+ rotated refresh cookie)
Retry protected request
```

### Common flows frontend must support

- Manual login (email/password).
- OAuth login redirect flow.
- Silent refresh lifecycle.
- Explicit logout cleanup.
- Profile update/delete/password change with bearer token.

### Edge/failure cases to handle in UI

- Missing refresh cookie -> `/auth/refresh/` returns 401 with `No refresh token.`
- Invalid/expired refresh -> `/auth/refresh/` returns 401 with `Invalid refresh token.`
- OAuth callback errors (`invalid_oauth_state`, `missing_code`, `token_exchange_failed`, `profile_fetch_failed`, `registration_failed`, `email_already_registered`, etc.).
- Data-service unavailable -> proxy returns 502.

### Notes for data team / data-service contracts

- Gateway assumes data-service login returns user object including at least `id`, `name`, `email`, `role`.
- Gateway uses data-service user `id` to create shadow user PK.
- Any contract change in data-service auth payloads directly impacts token claim composition and profile routing.

---

## Evaluation Notes (Defense)

Evaluators may ask *why* this architecture exists. Current concise rationale:

1. **Gateway/data-service separation**
   - Gateway centralizes auth token mechanics and API-facing security concerns.
   - Data-service remains source-of-truth for user/domain records.

2. **Shadow user pattern**
   - Needed because SimpleJWT expects Django user model integration.
   - Allows JWT tooling reuse without duplicating identity DB in gateway.

3. **Refresh token in HttpOnly cookie**
   - Reduces XSS exposure compared to storing refresh tokens in JS-accessible storage.

4. **Rotating refresh + blacklist**
   - Limits replay window if a refresh token is leaked.

5. **OAuth state check**
   - Basic CSRF mitigation for authorization-code callback.

Tradeoffs to acknowledge:
- More moving parts (gateway + data-service + shadow-user sync complexity).
- OAuth currently registration-only (no account linking on duplicate email).
- JWT claims may drift from data-service state until next refresh/login.

---

## Possible Improvements

1. **Fix JWT refresh lifetime configuration naming mismatch**
   - `SLIDING_TOKEN_REFRESH_LIFETIME` is configured, but code uses regular refresh tokens.

2. **Add throttling/rate limiting**
   - Especially on `/auth/login/`, `/auth/refresh/`, `/auth/42/callback/`.

3. **Harden production settings**
   - Disable `DEBUG` in production, tighten host/cookie/security headers.

4. **Improve OAuth account linking strategy**
   - Current behavior fails if email already exists; implement secure linking/merge flow.

5. **Reduce token leakage in redirects**
   - OAuth success currently passes access token in query string; evaluate safer transport (e.g., one-time code exchange with frontend).

6. **Clarify CSRF model for cookie-backed refresh endpoint**
   - Document and enforce intended anti-CSRF strategy for cookie-bearing endpoints.

7. **Document and test data-service auth contract**
   - Add explicit schema/tests for required response fields and error codes.

