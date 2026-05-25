# Module Review for Team Meeting

These tables summarize the current module strategy for the project based on progress, implementation risk, and delivery value. Module names in the tables link to detailed notes below.

**Target:** 14 mandatory points + 5 bonus points = **19 points** (subject caps bonus at 5).

## Must have / under development (14 points)

| Module | Points | Current status | Module lead (person names) | Notes / Decisions |
|---|---:|---|---|---|
| [**Web Major 1 – Framework for frontend and backend**](#web-major-1--framework-for-frontend-and-backend) | 2 | **Completed** | All | Foundation of the whole project. **Keep.** |
| [**Web Major 2 – Real-time features**](#web-major-2--real-time-features) | 2 | **Completed** | **Ricardo** | Real-time chat satisfies requirements. **Keep.** |
| [**Web Major 3 – User interaction (chat, profiles, friends)**](#web-major-3--user-interaction-chat-profiles-friends) | 2 | **Completed** | **Ricardo** + Erik + Leonardo Maes | Implemented. **Keep.** |
| [**User Major 1 – Standard user management and authentication**](#user-major-1--standard-user-management-and-authentication) | 2 | Features missing | **Raphael** + Ricardo + Erik | Check with the group if all is implemented **Keep.** |
| [**User Major 2 – Advanced permission system**](#user-major-2--advanced-permission-system) | 2 | Admin frontend missing | **Raphael** + Leonardo Maes | TO DO: build the admin frontend (view, edit, delete users; role-based views). **Keep.** |
| [**DevOps Major 2 – Monitoring system with Prometheus and Grafana**](#devops-major-2--monitoring-system-with-prometheus-and-grafana) | 2 | **Completed** | **Leonardo Vichi** | Dashboards in place. Confirm alerting + secure access during evaluation. **Keep.** |
| [**User Minor 2 – Remote authentication with OAuth 2.0**](#user-minor-2--remote-authentication-with-oauth-20) | 1 | **Completed** | **Ricardo** + Erik | Implemented and working. **Keep.** |
| [**Web Minor 9 – Advanced search**](#web-minor-9--advanced-search) | 1 | Frontend missing | **Leonardo** + Raphael + Erik | Backend largely ready; frontend filters/sort/pagination still to wire up. **Keep.** |
| **Total** | **14** |  |  |  |

## Bonus modules (max 5 points)

Bonus is only considered if the 14 mandatory points are reached. Subject caps the bonus at 5 points.

| Module | Points | Current status | Module lead (person names) | Notes / Decisions |
|---|---:|---|---|---|
| [**Web Minor 4 – Notification system**](#web-minor-4--notification-system) | 1 | **Completed** | **Ricardo** | End-to-end notifications for create/update/delete actions. **Keep.** |
| [**Accessibility Minor 4 – Support for additional browsers**](#accessibility-minor-4--support-for-additional-browsers) | 1 | Partially validated | **Erik** | Chrome + Firefox confirmed. **Pick a second browser and validate.** |
| [**Module of Choice Major – Internal mTLS / PKI between services**](#module-of-choice-major--internal-mtls--pki-between-services) | 2 | **Completed** | **Leonardo Vichi** | Full PKI subsystem already in `srcs/pki/` (own CA, per-service certs, scripts, tests). Try to pitch as mTLS, not just "internal HTTPS".
| [**Module of Choice Minor – Stripe payment integration**](#module-of-choice-minor--stripe-payment-integration) | 1 | Backend partial, frontend missing | **Raphael** | Highest-risk bonus point. Needs full flow: product → checkout → webhook → order persisted → confirmation in UI. **Drop if frontend will not ship in time.** |
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

**Outstanding work:** avatar upload, friends + online status, profile page polish.

### User Major 2 – Advanced permission system

**Justification:** Roles already exist in the backend. The remaining work is the admin frontend exposing the CRUD and role-based views.

**Requirements from the subject:**
- View, edit, and delete users (CRUD).
- Roles management (admin, user, guest, moderator, etc.).
- Different views and actions based on user role.

**Outstanding work:** admin frontend.

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

**Justification:** Backend is largely ready; a cheap point once filters/sort/pagination are wired into the frontend.

**Requirements from the subject:**
- Advanced search with filters, sorting, and pagination.

**Outstanding work:** frontend filters, sorting, and pagination UI.

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

### Module of Choice Major – Internal mTLS / PKI between services

**Justification:**
- *Why chosen:* The subject only requires HTTPS at the edge (browser ↔ backend). All internal container-to-container traffic is allowed to be unencrypted. This module extends TLS to **every internal hop** with mutual authentication, going meaningfully beyond the mandatory baseline.
- *Technical challenges addressed:* running an internal certificate authority, generating per-service certificates, distributing them to each container, configuring mTLS so each service both presents and verifies a certificate, cert lifecycle (issuance, rotation, revocation), and automating all of this in the compose stack.
- *Value to the project:* defense-in-depth even inside the private network — a compromised container cannot impersonate another service.
- *Why Major (2 points):* the PKI is a standalone subsystem (`srcs/pki/`) with its own service, scripts, and tests, integrated across backend, database, gateway, and monitoring. Comparable in weight to the Cybersecurity Major (WAF + Vault).

**Risks:**
- The subject explicitly warns that trivial "Module of Choice" implementations are rejected. The README **must frame this as mTLS / full PKI subsystem**, not "we turned on HTTPS internally."
- If the evaluator decides the scope is too small, the module may be downgraded to Minor (1 point), breaking the 19-point math.

**Demo checklist for evaluation:**
- Show the `srcs/pki/` service (CA, scripts, tests).
- Show certificates issued per service and mounted into each container.
- Show a service rejecting a connection without a valid client certificate (mTLS proof).
- Walk through cert rotation.

### Module of Choice Minor – Stripe payment integration

**Justification:**
- *Why chosen:* a marketplace needs a real payment path; using Stripe (a recognized provider) makes the flow inspectable end-to-end.
- *Technical challenges addressed:* Stripe Checkout integration, webhook signature verification, idempotent order persistence, syncing payment state with the application's order/listing state.
- *Value to the project:* completes the e-commerce loop (list → buy → confirm) that the marketplace concept implies.
- *Why Minor (1 point):* scope is limited to a single provider and a single payment flow (no subscriptions, refunds, or multi-currency).

**Outstanding work:** frontend checkout flow, success/failure pages, and webhook-driven order confirmation in the UI.

**Risks (highest of all bonus picks):**
- The subject rejects "trivial" Module of Choice implementations. A bare Stripe button is not enough; a working end-to-end purchase with persisted order state is required.
- Frontend is not yet implemented. **Decision rule:** if the frontend will not ship before evaluation, drop this module and accept 18 points instead of 19.

**Demo checklist for evaluation:**
- Add a product to cart in the UI.
- Pay via Stripe test card.
- Webhook lands, order row is created/updated.
- User sees confirmation in the UI; admin sees the order.

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