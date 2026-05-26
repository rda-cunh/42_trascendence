# Module Review for Team Meeting

These tables summarize the current module strategy for the project based on progress, implementation risk, and delivery value. Module names in the tables link to detailed notes below.

**Target:** 14 mandatory points + 5 bonus points = **19 points** (subject caps bonus at 5).

## Must have / under development (14 points)

| Module | Points | Current status | Module lead (person names) | Notes / Decisions |
|---|---:|---|---|---|
| [**Web Major 1 – Framework for frontend and backend**](#web-major-1--framework-for-frontend-and-backend) | 2 | **Completed** | All | Foundation of the whole project. **Keep.** |
| [**Web Major 2 – Real-time features**](#web-major-2--real-time-features) | 2 | **Completed** | **Ricardo** | Real-time chat satisfies requirements. **Keep.** |
| [**Web Major 3 – User interaction (chat, profiles, friends)**](#web-major-3--user-interaction-chat-profiles-friends) | 2 | **Completed** | **Ricardo** + Erik + Leonardo Maes | Implemented. **Keep.** |
| [**User Major 1 – Standard user management and authentication**](#user-major-1--standard-user-management-and-authentication) | 2 | **Completed** | **Raphael** + Ricardo + Erik | Avatar upload (with default-avatar fallback), friends + live online status, and profile page all shipped. **Keep.** |
| [**User Major 2 – Advanced permission system**](#user-major-2--advanced-permission-system) | 2 | **Completed** | **Raphael** + Leonardo Maes | Admin frontend shipped (Dashboard, UserManagement with ban/unban/delete/promote/revoke, ListingModeration). Admin auto-created on startup from `.env`. **Keep.** |
| [**DevOps Major 2 – Monitoring system with Prometheus and Grafana**](#devops-major-2--monitoring-system-with-prometheus-and-grafana) | 2 | **Completed** | **Leonardo Vichi** | Dashboards in place. Confirm alerting + secure access during evaluation. **Keep.** |
| [**User Minor 2 – Remote authentication with OAuth 2.0**](#user-minor-2--remote-authentication-with-oauth-20) | 1 | **Completed** | **Ricardo** + Erik | Implemented and working. **Keep.** |
| [**Web Minor 9 – Advanced search**](#web-minor-9--advanced-search) | 1 | **Completed** | **Leonardo** + Raphael + Erik | Frontend filters (category, price range), sort (newest/price-asc/price-desc), debounced search, and pagination are wired against the backend `/api/listings/` endpoint. **Keep.** |
| **Total** | **14** |  |  |  |

## Bonus modules (max 5 points)

Bonus is only considered if the 14 mandatory points are reached. Subject caps the bonus at 5 points.

| Module | Points | Current status | Module lead (person names) | Notes / Decisions |
|---|---:|---|---|---|
| [**Web Minor 4 – Notification system**](#web-minor-4--notification-system) | 1 | **Completed** | **Ricardo** | End-to-end notifications for create/update/delete actions. **Keep.** |
| [**Accessibility Minor 4 – Support for additional browsers**](#accessibility-minor-4--support-for-additional-browsers) | 1 | Partially validated | **Erik** | Chrome + Firefox confirmed. **Pick a second browser and validate.** |
| [**Module of Choice Major – Internal PKI / authenticated TLS for all service-to-service traffic**](#module-of-choice-major--internal-pki--authenticated-tls-for-all-service-to-service-traffic) | 2 | **Completed** | **Leonardo Vichi** | Pitch updated: framed as **internal PKI + CA-authenticated TLS on every internal hop**, not "mTLS." PKI subsystem in `srcs/pki/` (own CA, SANs for 15+ internal services, MySQL boot ordering fixed today). Gateway and upstreams all run on CA-signed certs and the gateway verifies every upstream against the internal CA. **Keep.** |
| [**Module of Choice Minor – Stripe payment integration**](#module-of-choice-minor--stripe-payment-integration) | 1 | **End-to-end flow shipped (session-driven, not webhook)** | **Raphael** | Frontend Checkout / Success / Failure / Redirect pages shipped today. Backend `create_checkout` opens a Stripe Checkout Session; order is persisted on the return path by retrieving the session and verifying `payment_status == "paid"`. **No webhook receiver yet** — decide whether to add one before evaluation. |
| **Total bonus** | **5** |  |  |  |

## Drop for now

| Module | Points | Current status | Module lead (person names) | Notes / Decisions |
|---|---:|---|---|---|
| [**Web Major 4 – Public API**](#web-major-4--public-api) | 2 | Endpoints partly prepared | [N/A – dropping] | No room left under the 5-point bonus cap. Useful as a safety net if mTLS or Stripe gets rejected at evaluation. **Drop, but keep as fallback.** |
| [**Web Minor 10 – File upload and management system**](#web-minor-10--file-upload-and-management-system) | 1 | Not implemented | [N/A – dropping] | Would help the marketplace UX but adds complexity outside the 19-point target. **Drop.** |
| [**DevOps Major 3 – Backend as microservices**](#devops-major-3--backend-as-microservices) | 2 | Not implemented | [N/A – dropping] | High complexity, no progress. **Drop.** |
| [**Gaming Major 5 – Advanced 3D graphics**](#gaming-major-5--advanced-3d-graphics) | 2 | Not implemented | [N/A – dropping] | Frontend-heavy, no visible progress. **Drop.** |
| [**User Minor 4 – User activity analytics**](#user-minor-4--user-activity-analytics) | 1 | Not implemented | [N/A – dropping] | Not needed for the 19-point target. **Drop.** |
| [**AI Minor 1 – Content moderation AI**](#ai-minor-1--content-moderation-ai) | 1 | Not implemented | [N/A – dropping] | Out of scope. **Drop.** |
| [**DevOps Major 1 – ELK / log management**](#devops-major-1--elk--log-management) | 2 | Not started | [N/A – dropping] | Monitoring module already covers the DevOps slot. **Drop.** |

---

## Must have details

### Web Major 1 – Framework for frontend and backend

**Justification:** Foundation of the whole application; satisfies the mandatory frontend + backend + database requirement.

**Requirements from the subject:**
- Use a framework for both the frontend and backend.
- Acceptable frontend examples: React, Vue, Angular, Svelte.
- Acceptable backend examples: Express, NestJS, Django, Flask, Ruby on Rails.
- Full-stack frameworks (Next.js, Nuxt.js, SvelteKit) count for both if both halves are used.

### Web Major 2 – Real-time features

**Justification:** Real-time chat is implemented and clearly distinct from the user interaction module (the chat *transport* is the deliverable here, not the chat product itself).

**Requirements from the subject:**
- Real-time features using WebSockets or similar technology.
- Real-time updates across clients.
- Graceful handling of connection / disconnection.
- Efficient message broadcasting.

### Web Major 3 – User interaction (chat, profiles, friends)

**Justification:** Fits the social/marketplace direction and reuses the user system. Concrete and demoable.

**Requirements from the subject:**
- Basic chat to send/receive messages between users.
- Profile system to view user information.
- Friends system: add/remove friends and see friends list.

### User Major 1 – Standard user management and authentication

**Justification:** Core building block; reinforces the mandatory secure signup/login requirement.

**Requirements from the subject:**
- Users can update their profile information.
- Users can upload an avatar (with a default avatar fallback).
- Users can add others as friends and see their online status.
- Users have a profile page displaying their information.

**Status:** all four requirements are in place.
- Profile updates and password change live in the profile page (validation aligned with signup; password-change UI hidden for 42 OAuth sessions where it does not apply).
- Avatar upload runs through the dedicated `image-service` (size/MIME/extension validation, progress reporting), with a default avatar assigned on signup and on 42 OAuth when the provider gives no picture.
- Friends / follow API is wired into the Friends page, with live online status pulled from the presence service.
- Profile page displays user information, listings, and orders.

### User Major 2 – Advanced permission system

**Justification:** Roles already exist in the backend. The admin frontend exposing CRUD and role-based views shipped today.

**Requirements from the subject:**
- View, edit, and delete users (CRUD).
- Roles management (admin, user, guest, moderator, etc.).
- Different views and actions based on user role.

**Status:** complete.
- Admin frontend (`features/admin/`) exposes a Dashboard (metrics + charts), User Management (search, filter by status, ban/unban, delete, promote/revoke admin), and Listing Moderation (search, status filter, delete) — all gated by role-based access.
- Admin user is auto-provisioned on startup from `.env` values.
- Product list and seller actions render in management mode when the viewer is an admin.

### DevOps Major 2 – Monitoring system with Prometheus and Grafana

**Justification:** Already in place and demoable through dashboards and metrics. More realistic than microservices or ELK.

**Requirements from the subject:**
- Prometheus collecting metrics.
- Exporters and integrations configured.
- Custom Grafana dashboards.
- Alerting rules set up.
- Secure access to Grafana.

### User Minor 2 – Remote authentication with OAuth 2.0

**Justification:** Already implemented; complements base auth and improves onboarding.

**Requirements from the subject:**
- Remote authentication with OAuth 2.0 (Google, GitHub, 42, etc.).

### Web Minor 9 – Advanced search

**Justification:** Frontend filters/sort/pagination are now wired against the backend listing endpoint.

**Requirements from the subject:**
- Advanced search with filters, sorting, and pagination.

**Status:** complete.
- Home page provides debounced text search, category filter, min/max price filter, sort (newest / price ascending / price descending) and page-based pagination (Prev/Next, `hasMore`).
- Backend `/api/listings/` supports `search`, `status`, `seller_id`, `page`, with `ORDER BY created_at DESC` and SQL `LIMIT / OFFSET`.

---

## Bonus details

### Web Minor 4 – Notification system

**Justification:** Complete notification flow for create/update/delete actions is implemented end-to-end. Demonstrable across user, friends, product, and chat events.

**Requirements from the subject:**
- A complete notification system for all creation, update, and deletion actions.

**Demo checklist for evaluation:**
- C/U/D event on at least: user profile, friends, products/listings, chat events → user-visible notification each time.

### Accessibility Minor 4 – Support for additional browsers

**Justification:** The project is already tested on Chrome and Firefox. Adding one more non-Chromium browser (Safari or Edge) closes the requirement.

**Requirements from the subject:**
- Full compatibility with at least 2 additional browsers (beyond Chrome).
- Test and fix all features in each browser.
- Document any browser-specific limitations.
- Consistent UI/UX across all supported browsers.

**Notes / risks:**
- Chromium and Brave share Chrome's engine and are very likely **not accepted** as "additional" browsers. Do not claim them.
- Safe combos: **Chrome + Firefox + Safari**, or **Chrome + Firefox + Edge**.
- README must list the supported browsers and any known limitations.

### Module of Choice Major – Internal PKI / Authenticated TLS for all service-to-service traffic

**Renamed from "Internal mTLS / PKI between services"** — see status section. The pitch is now framed around the PKI subsystem and CA-authenticated TLS on every internal hop, which is what is actually shipping.

**Justification (Major, 2 points):**
- *Why chosen:* The subject only mandates HTTPS at the edge (browser ↔ gateway). All internal container-to-container traffic is allowed to be plaintext. This module rebuilds the trust chain **inside** the private network with our own CA and CA-signed certs on every service, so no hop on the path of a user request is unauthenticated cleartext.
- *Technical challenges addressed:* running an internal certificate authority (4096-bit RSA root, 10-year validity, isolated from public CAs); generating per-service leaf certs with proper SANs covering each compose service name; orchestrating cert issuance **before** dependent services boot (the MySQL container is explicitly gated on cert generation, fix shipped today); distributing certs to each container via a shared `/certs` volume; configuring TLS on backend, data-service, image-service, gateway, and the monitoring stack (Grafana / Prometheus / Loki / Promtail / exporters); preserving trust across restarts by reusing the existing CA.
- *Value to the project:* a hostile actor with a foothold inside the docker network cannot just speak HTTP to `backend:8000` or `data-service:8001` — every internal endpoint terminates TLS and presents a cert signed by our internal CA, and every internal client verifies that signature. Internal traffic confidentiality is real, and a rogue container cannot impersonate a known service without obtaining a CA-signed cert.
- *Scope = Major, not Minor:* the PKI is a standalone subsystem (`srcs/pki/`) with its own compose service, its own SAN configuration covering 15+ internal DNS names, its own startup ordering, and integration changes in **every** other service folder. It is not "we added a flag to nginx" — it is a dedicated component on which the rest of the platform now depends.

**Current implementation status (verified 2026-05-27):**
- `srcs/pki/scripts/gen-certs.sh` generates the root CA and an internal leaf cert with SANs for `backend`, `database`, `gateway`, `data-service`, `image-service`, `prometheus`, `grafana`, `loki`, `promtail`, `mysqld-exporter`, `node-exporter`, `cadvisor`, `nginx-exporter-gateway`, `nginx-exporter-frontend`, `frontend` (15 entries).
- `srcs/pki/docker-compose.yaml` runs the cert generator before any consumer service starts; the database compose was updated today (`fix(database): ensure MySQL starts after internal certificates are generated`).
- Gateway terminates TLS for external traffic **and** opens TLS connections to every upstream, verifying the upstream cert against our internal CA: `proxy_ssl_verify on; proxy_ssl_trusted_certificate /certs/${CA_CRT_NAME};` on `/api/`, `/api/auth/`, `/api/orders/`, `/ws/`, `/images/`, the frontend route, and the monitoring subpath.
- Internal services (`backend`, `data-service`, `image-service`, `grafana`, etc.) listen on HTTPS using their CA-signed certs, so the gateway's verification actually has something to verify.
- Cert lifetime / rotation: script is idempotent — if `$CA_CRT` is already present the volume is preserved, so trust survives container restarts and only a deliberate volume wipe re-issues certificates.

**Honest scope note:** at the time of evaluation, the handshake authenticates the **server side** of every internal hop (the gateway and other internal callers verify that the upstream they are talking to is signed by our CA). The gateway does not currently *present* a client certificate to upstreams, and upstreams do not require one (no `ssl_verify_client on`). We deliberately do **not** market this as mTLS in the README — we market it as **"internal PKI with CA-authenticated TLS on every service-to-service hop"**. This framing is accurate and still meaningfully exceeds the subject's edge-only HTTPS baseline.

**Why this should still hold as Major:**
- The subject's complaint about "trivial Module of Choice" is aimed at things like "we changed a config flag." Here we deliver a *new subsystem* (`srcs/pki/`), a *new dependency* in the compose graph, *new SAN strategy* covering 15+ services, and *cross-cutting changes* in every other service folder — that is the body of work a Major calls for, regardless of whether the handshake is one-way or two-way.
- The Cybersecurity Major comparison still holds: WAF + Vault is "we added two services and integrated them" — same shape as "we added a PKI service and integrated it across the platform."
- The deliverable is something an evaluator can *see fail*: kill the cert volume, restart, and the entire internal call graph breaks until certs are reissued. That demonstrability is the point.

**Risks (now better understood, not catastrophic):**
- An evaluator who reads "Internal mTLS" in older docs and then sees one-way verification could push for a downgrade. **Mitigation:** rename the module everywhere user-facing (README, evaluation walkthrough, this doc) to "Internal PKI / authenticated TLS." That is what we built and what we should defend.
- If after all that the evaluator still downgrades this to Minor (1 point), the 19-point math becomes 18. That is the worst-case fallback and is acceptable — the project remains comfortably above the threshold.

**Demo checklist for evaluation:**
- Open `srcs/pki/`: show the CA, the SAN config, the generation script.
- Show the compose graph: every internal service mounts `/certs` and has its TLS listener bound to a CA-signed cert.
- `curl -v https://backend:8000/...` from inside the network without the CA in the trust store → handshake fails. Repeat with `--cacert /certs/ca.crt` → success. This is the live proof.
- Show MySQL startup depending on cert generation (today's fix).
- Walk through cert lifecycle: stopping/starting the stack preserves certs; deleting the cert volume forces a re-issuance and re-establishes trust without code changes.

### Module of Choice Minor – Stripe payment integration

**Justification:**
- *Why chosen:* a marketplace needs a real payment path; using Stripe (a recognized provider) makes the flow inspectable end-to-end.
- *Technical challenges addressed:* Stripe Checkout Session creation server-side, server-side payment-status verification before order persistence, syncing payment state with the application's order/listing state.
- *Value to the project:* completes the e-commerce loop (list → buy → confirm) that the marketplace concept implies.
- *Why Minor (1 point):* scope is limited to a single provider and a single payment flow (no subscriptions, refunds, or multi-currency).

**Current implementation status (verified 2026-05-27):**
- Frontend Checkout flow shipped: `Checkout.tsx`, `CheckoutSuccess.tsx`, `CheckoutFailure.tsx`, `CheckoutRedirect.tsx`.
- Backend `POST /api/orders/create-checkout/` opens a Stripe Checkout Session with the cart line items, stamps the `buyer_id` in session metadata, and returns the checkout URL.
- On return, the success page sends the `session_id` to `POST /api/orders/<session_id>/`, which retrieves the session from Stripe, checks `payment_status == "paid"`, validates `buyer_id` against the authenticated user, and only then persists the order via the data-service.
- This is a **session-retrieval flow, not a webhook-driven flow.** Stripe accepts both patterns for the standard one-shot checkout case; webhooks become important when the success redirect is unreliable (closed tab, slow networks, async payment methods).

**Outstanding / optional work:**
- Adding a `POST /api/stripe/webhook/` endpoint with signature verification (`stripe.Webhook.construct_event`) would make the order-persistence path resilient to a user closing the tab before the success redirect lands. Not required for the Minor to be defensible, but recommended if time allows.

**Risks:**
- The subject rejects "trivial" Module of Choice implementations. The current flow is end-to-end (cart → Stripe-hosted checkout → server-verified payment → persisted order → confirmation in UI), which is materially more than a "Stripe button." The Minor framing remains appropriate.
- If an evaluator insists on webhook delivery as part of the demo, fall back on the optional webhook above.

**Demo checklist for evaluation:**
- Add a product to cart in the UI.
- Pay via Stripe test card on the Stripe-hosted checkout page.
- Land on the success page → backend retrieves the session, verifies payment, persists the order.
- User sees confirmation in the UI / orders list; admin sees the order in the admin dashboard.
- If asked: explain that webhook delivery would be the production-resilient variant and point to the session-retrieve-on-success path that backstops it today.

---

## Drop for now details

### Web Major 4 – Public API

**Status:** several endpoints already exist that could be hardened into a public API. Keeping the module documented here as a **fallback** in case the mTLS Major is downgraded or the Stripe Minor is rejected at evaluation.

**Requirements from the subject:**
- Public API to interact with the database.
- Secured with an API key.
- Rate limiting.
- Documentation.
- At least 5 endpoints (GET, POST, PUT, DELETE).

### Web Minor 10 – File upload and management system

**Justification for drop:** would help marketplace listings but adds complexity outside the 19-point target.

**Requirements from the subject:**
- Multiple file types (images, documents).
- Client + server-side validation (type, size, format).
- Secure file storage with access control.
- File preview where applicable.
- Upload progress indicators.
- Ability to delete uploaded files.

### DevOps Major 3 – Backend as microservices

**Justification for drop:** High complexity, no implementation progress.

**Requirements from the subject:**
- Loosely-coupled services with clear interfaces.
- REST APIs or message queues for communication.
- Each service with a single responsibility.

### Gaming Major 5 – Advanced 3D graphics

**Justification for drop:** Frontend-heavy and no visible progress.

**Requirements from the subject:**
- Advanced 3D graphics using Three.js or Babylon.js.
- Immersive 3D environment.
- Advanced rendering techniques.
- Smooth performance and interaction.

### User Minor 4 – User activity analytics

**Justification for drop:** Not needed for the 19-point target and no current progress.

**Requirements from the subject:**
- User activity analytics and insights dashboard.

### AI Minor 1 – Content moderation AI

**Justification for drop:** Adds complexity without supporting the core delivery target.

**Requirements from the subject:**
- AI-based content moderation (auto moderation, auto deletion, auto warning).

### DevOps Major 1 – ELK / log management

**Justification for drop:** Monitoring module already covers the DevOps slot; ELK adds setup and operational work that is not needed.

**Requirements from the subject:**
- Elasticsearch for log storage and indexing.
- Logstash for log collection and transformation.
- Kibana for visualization and dashboards.
- Log retention and archiving policies.
- Secure access to all components.