# Transcendence

*This project has been created as part of the 42 curriculum by ecarvalh, lmaes, lvichi, rapcampo and rda-cunh.*

## Description

Transcendence is a full‑stack web **marketplace** platform where users can buy and sell items with messaging, ratings, payments, and powerful search, including rich 3D previews for visual content such as shaders or digital assets.
Our goal is to build a production‑like application using modern web frameworks, real‑time communication, microservices, and DevOps tooling, while satisfying the ft_transcendence mandatory requirements and module system.

### Product Vision

Transcendence aims to be a "showcase marketplace" where creators and buyers can safely transact digital assets with real‑time feedback, clear trust signals, and rich previews that reduce uncertainty before purchase.
The project is designed as a realistic learning platform for the team: we want an architecture that could plausibly be deployed and maintained in production, not just a prototype that passes evaluation.

We will prioritize:

- A solid, secure core (auth, roles, data model, payments) so the app is usable end‑to‑end even with a minimal UI.
- Strong observability and modular backend so iterating on features remains fast and low‑risk.
- A UX that highlights trust (reviews, permissions, notifications) and clarity (search, previews) over raw feature count.

### Feature Prioritization

We will build the product in three main layers: **base platform**, **core marketplace modules**, and **enhancements/alternatives**.

1. **Base platform (must‑have foundation)**
   - Frontend and backend frameworks running end‑to‑end.
   - User registration, login, basic profiles, and role model.
   - Minimal item listing and browsing backed by a relational database.
   - Containerized deployment behind Nginx with a single command to start the app.

2. **Core marketplace modules (MVP completeness)**
   - Real‑time layer (for notifications and live updates).
   - File upload pipeline for item images/assets.
   - Full notification system for events.
   - Payment system integrated in the purchase flow.
   - Microservice decomposition of backend domains.
   - 3D preview module for supported assets.

3. **Enhancement and alternative modules (risk management)**
   - Social/interaction and search modules (chat, advanced search, analytics, OAuth, AI moderation) added once the MVP is stable.
   - A set of pre‑chosen "alternative modules" that can replace riskier choices if needed without compromising the marketplace concept.

## Instructions

> ⚠️ **[DRAFT — Update once stack and deployment are finalized]**
>
> Prerequisites (planned):
>
> - Docker and Docker Compose installed.
> - Node.js (LTS) for local development of frontend/backend services.
> - PostgreSQL (or Dockerized PostgreSQL) if running services outside Docker Compose.
>
> Setup:
>
> 1. Clone the repository.
> 2. Copy `.env.example` to `.env` in service directory and fill in required variables (DB credentials, OAuth keys, payment provider keys, JWT secrets, etc.).
> 3. Start the stack: `docker compose up --build`
> 4. Access the app in the latest stable version of Google Chrome at `http://localhost:443` or `http://transcendence.42.fr`.

## Resources

> ⚠️ **[DRAFT — Fill as the project progresses before evaluation]**
>
> Planned references:
>
> - Official documentation for selected frameworks (React, NestJS, etc.).
> - PostgreSQL and ORM documentation.
> - Docker / Docker Compose / DevOps tooling documentation.
> - Articles or tutorials on WebSockets / real‑time communication, payment integration, and 3D rendering with Three.js or similar.
>
> *(To be expanded with concrete references before evaluation.)*
>
> **AI usage:**
>
> - Brainstorming architecture options, module combinations, and risk analysis.
> - Assisting in structuring and drafting project documentation and README file.
> - Generating boilerplate code snippets or configuration examples, always reviewed and refactored by the team.
> - Reviewing complex logic flows to help identify the root causes of bugs and support debugging.
>
> *(To be expanded with concrete tasks, and validation notes before evaluation.)*

## Team Information

| Login | Name | Role | Responsibilities |
|---|---|---|---|
| rda-cunh | Ricardo Mendes | Product Owner (PO) / Full‑Stack Developer | Owns product vision, feature prioritization, and backlog; validates completed features from a product/user perspective. |
| rapcampo | Raphael Vieira | Project Manager (PM) / Backend Developer | Organizes sprints, meetings, and deadlines; coordinates task distribution; implements and maintains core backend services. |
| lvichi | Leonardo Vichi | Technical Lead / DevOps Engineer | Defines architecture and tech stack; oversees code quality; leads infrastructure, microservices, and CI/CD pipeline setup. |
| ecarvalh | Erik Lustosa | Frontend Lead | Leads UI/UX and frontend architecture; maintains design system and component library; integrates frontend with APIs and real‑time services. |
| lmaes | Leonardo Maes | Data Science Engineer | Designs database schema and analytics; leads recommendation and AI‑driven modules; ensures data quality and performance. |

## Project Management

### Scheduled meetings and planned sessions:

| Date | Topic |
| --- | --- |
| 2026-02-04 | Discussion of viable projects and general ideas |
| 2026-02-12 | Discussion of Marketplace project with new member |
| 2026-02-17 | Final member added and discussion of roles and modules to tackle |
| 2026-02-20 | Creation of Github repo, readme, and general skeleton of the project |

### Tools

- **Meetings**: Weekly, sprint‑based structure (planning, async stand‑ups, review, retrospective).
- **Communication**: Discord (main channel for async and voice), WhatsApp (quick updates/emergencies).
- **Project management**: GitHub Projects (Kanban board), GitHub Issues for tasks and bugs, separate documentation folder for decisions and architecture notes.
- **Code review**: GitHub Pull Requests — at least one reviewer required per significant change.
- **Containerization**: Docker for all services, with a single command to run the full application stack.

## Technical Stack

> ⚠️ **[DRAFT — Confirm and justify choices before evaluation]**

| Layer | Technology | Status | Reasoning |
|---|---|---|---|
| Frontend | React + Vite | Confirmed | Strong ecosystem, component model, fast dev experience with Vite. |
| Backend | Node.js + NestJS | To confirm with rapcampo | Opinionated framework with DI, modules, and good support for REST/WebSockets. |
| Backend (AI/ML) | Python microservice(s) | Optional / TBD | May be needed for data science modules; to confirm with lmaes. |
| Database | PostgreSQL | To confirm with lmaes | Relational schema fits marketplace data; strong reliability and tooling. |
| ORM | Prisma or TypeORM | TBD | Simplifies schema management and migrations. |
| Infrastructure | Debian Linux VM + Openbox | Confirmed | Lightweight VM for hosting the stack. |
| Containers | Docker + Docker Compose | Confirmed | All services containerized; single-command startup. |
| Entry Point | Nginx (container) | Confirmed | Reverse proxy for routing and TLS termination. |
| Internal APIs | REST + WebSockets | Confirmed | REST for standard CRUD; WebSockets for real‑time features. |

## Database Schema

> ⚠️ **[DRAFT — Fill once data model is finalized]**
>
> Planned entities and relationships:
>
> - **User** — id, email, password_hash, avatar, role_id, created_at, updated_at
> - **Role** — id, name (admin, seller, buyer, moderator, guest)
> - **Item / Listing** — id, seller_id (→ User), title, description, price, status, created_at
> - **File / Asset** — id, item_id (→ Item), url, type, size, created_at
> - **Order** — id, buyer_id (→ User), item_id (→ Item), status, created_at
> - **Payment** — id, order_id (→ Order), provider_ref, amount, currency, status, created_at
> - **Notification** — id, user_id (→ User), event_type, payload, read, created_at
> - **Message** — id, sender_id (→ User), receiver_id (→ User), content, created_at
> - **Rating** — id, reviewer_id (→ User), target_id (→ User or Item), score, comment, created_at
>
> Key relationships:
> - A User has many Listings (as seller) and many Orders (as buyer).
> - Each Order references one Item and one Payment.
> - Notifications are triggered by CRUD events on Listings, Orders, and Messages.
>
> *(Replace with a diagram or migration-derived schema once implementation begins.)*

## Features List

> ⚠️ **[DRAFT — Complete as implementation progresses]**
>
> Each feature should be documented with: description, related module, and responsible team member(s).
>
> Example:
> - **User registration and login** — Email/password authentication with validation and error handling. *(User Major 1)* — rda-cunh, rapcampo

## Modules

### Proposed Project and Modules

Points are calculated as **x / y**, where x is the total validated points and y is the maximum possible across all modules considered for implementation.

#### Core Modules (High and Medium Priority)

These are the modules we actively plan to implement for our Marketplace MVP. They are selected to provide a complete marketplace experience (frameworks, real‑time, uploads, users, roles, payments, notifications, and 3D previews).

| Module | Description | Priority | Points | Subject Page |
|---|---|---|---|---|
| [Web Major 1](#web-major-1) | Framework for both frontend and backend | High | 2 | 12 |
| [Web Major 2](#web-major-2) | Real-time features using WebSockets or similar | High | 2 | 12 |
| [Web Minor 4](#web-minor-4) | Complete notification system (creation/update/delete) | Medium | 1 | 12 |
| [Web Minor 10](#web-minor-10) | File upload and management system | High | 1 | 13 |
| [User Major 1](#user-major-1) | Standard user management and authentication | High | 2 | 14 |
| [User Major 2](#user-major-2) | Advanced permission system (roles and access control) | High | 2 | 14 |
| [Module of Choice](#module-of-choice) | Payment system for the marketplace | High | 1–2 | 20 |
| [DevOps Major 3](#devops-major-3) | Backend as microservices | High | 2 | 19 |
| [Gaming Major 5](#gaming-major-5) | Advanced 3D graphics (shader/asset previews) | Medium | 2 | 17 |
| **Total** | | | **15–16** | |

#### Extra & Potential Alternative Modules

These modules are candidates for later sprints or for replacing riskier modules if needed. They focus on improving user experience, integrations, analytics, and AI features for the Marketplace.

| Module | Description | Priority | Points | Subject Page |
|---|---|---|---|---|
| [Web Major 3](#web-major-3) | User interaction (chat, profiles, friends) | Optional | 2 | 12 |
| [Web Major 4](#web-major-4) | Public API with API key, rate limiting, documentation | Optional | 2 | 12 |
| [Web Minor 9](#web-minor-9) | Advanced search with filters, sorting, pagination | Optional | 1 | 13 |
| [User Minor 2](#user-minor-2) | Remote authentication with OAuth 2.0 (Google, GitHub, 42) | Optional | 1 | 14 |
| [User Minor 4](#user-minor-4) | User activity analytics and insights dashboard | Optional | 1 | 14 |
| [AI Minor 1](#ai-minor-1) | Content moderation AI (auto‑flagging content) | Optional | 1 | 15 |

---

### Justification for Core Modules

#### Web Major 1

**Use a framework for both the frontend and backend — 2 pts**

We chose Web Major 1 because a marketplace requires a maintainable, scalable structure rather than ad‑hoc scripts. Using React (frontend) and NestJS (backend) gives us clear conventions, routing, state management, and testability, which directly align with the subject's definition of a framework. This module also underpins many others (real‑time, microservices, 3D previews) by providing a consistent foundation for components, services, and APIs.

> **Subject requirements:**
> - Use a frontend framework (React, Vue, Angular, Svelte, etc.).
> - Use a backend framework (Express, NestJS, Django, Flask, Ruby on Rails, etc.).
> - Full‑stack frameworks (Next.js, Nuxt.js, SvelteKit) count as both if their frontend and backend capabilities are used.

---

#### Web Major 2

**Implement real‑time features using WebSockets or similar technology — 2 pts**

In a marketplace, users expect instant feedback: new messages, order status changes, and notifications should appear without manual refresh. Web Major 2 allows us to introduce a real‑time channel that powers notifications, live updates of item status, and later features such as chat or live bidding. By centralizing real‑time behavior in this module, we avoid scattering "polling hacks" across the codebase and demonstrate a robust, scalable real‑time architecture.

> **Subject requirements:**
> - Real‑time updates across clients.
> - Handle connection/disconnection gracefully.
> - Efficient message broadcasting.

---

#### Web Minor 4

**Complete notification system for all creation, update, and deletion actions — 1 pt**

Notifications are essential to user trust: buyers and sellers must know when listings are created, updated, sold, or removed. Web Minor 4 gives us a structured way to capture important CRUD events and deliver them as in‑app notifications, complementing Web Major 2 for real‑time delivery. This module also forces us to think about event design, persistence, and read models.

> **Subject requirements:**
> - A complete notification system for all creation, update, and deletion actions.

---

#### Web Minor 10

**File upload and management system — 1 pt**

A marketplace without images or asset files is unusable; sellers must be able to upload pictures or bundles, and buyers need previews. Web Minor 10 gives us a complete pipeline for file validation, storage, and access control, which ties directly into item listings and 3D previews. We will leverage this module to handle both simple thumbnails and richer asset packages in a secure and scalable way.

> **Subject requirements:**
> - Support multiple file types (images, documents, etc.).
> - Client-side and server-side validation (type, size, format).
> - Secure file storage with proper access control.
> - File preview functionality where applicable.
> - Progress indicators for uploads.
> - Ability to delete uploaded files.

---

#### User Major 1

**Standard user management and authentication — 2 pts**

User accounts are at the heart of any marketplace: identity, reputation, and relations between users (buyer/seller/friend) all build on this module. User Major 1 ensures we implement secure registration/login, profile management, avatars, and a basic social graph (friends, online status). These features provide the minimal trust layer necessary before introducing payments and more advanced permissions.

> **Subject requirements:**
> - Users can update their profile information.
> - Users can upload an avatar (with a default if none provided).
> - Users can add other users as friends and see their online status.
> - Users have a profile page displaying their information.

---

#### User Major 2

**Advanced permissions system — 2 pts**

A marketplace has clearly differentiated roles: buyers, sellers, and administrators must not have the same capabilities. User Major 2 lets us enforce role‑based access control over sensitive actions such as moderating content, managing users, or handling disputes. This module also supports future growth (e.g. support agents, moderators) without rewriting core authorization logic.

> **Subject requirements:**
> - View, edit, and delete users (CRUD).
> - Roles management (admin, user, guest, moderator, etc.).
> - Different views and actions based on user role.

---

#### Module of Choice

**Payment system for the marketplace — 1–2 pts (custom module)**

We chose to implement a dedicated **payment system** as our custom Module of Choice.

**Why this module:**
- **Relevance**: payments are what turn a listing site into a real marketplace — this is the most natural feature not explicitly covered by the existing catalogue of modules.
- **Technical challenges**: integrating with an external payment provider requires handling redirects or payment intents, managing webhooks, and reconciling transactions with orders in our database.
- **Complexity and architecture**: payments require careful error handling (failed payments, refunds), idempotency, and strong consistency between orders, balances, and item availability.

**How it adds value:**
- Enables end‑to‑end purchase flows so users can go from discovery to completed transaction within our platform.
- Forces cleaner domain boundaries (orders / payments / users), which aligns directly with the microservices goal of DevOps Major 3.
- Is a realistic, resume‑worthy feature connecting to real‑world engineering practices.

**Why it deserves Major status (2 pts):**
- It is not a cosmetic add‑on; it touches authentication, authorization, data modelling, and external integrations.
- It requires secure handling of secrets and environment variables, robust testing, and a clear UX for all payment states (pending, success, failure, refunded).
- It significantly increases the overall complexity and realism of the project compared to a simple "fake checkout."

---

#### DevOps Major 3

**Backend as microservices — 2 pts**

A marketplace naturally splits into domains (users, listings, orders, payments, notifications), and we want to reflect that in our architecture. DevOps Major 3 lets us design loosely coupled services with clear interfaces, reducing coupling and helping each team member own a bounded context. This module also showcases modern backend practices and prepares the project for future observability and scaling.

> **Subject requirements:**
> - Design loosely-coupled services with clear interfaces.
> - Use REST APIs or message queues for communication.
> - Each service should have a single responsibility.

---

#### Gaming Major 5

**Advanced 3D graphics — 2 pts**

For our marketplace, we want to go beyond static thumbnails and offer interactive 3D previews (e.g. shaders or 3D digital assets) so buyers can better evaluate items before purchase. Gaming Major 5 aligns perfectly with this goal: using a library like Three.js or Babylon.js, we can render immersive previews directly in the browser. This module demonstrates our ability to handle performance‑sensitive rendering, resource loading, and user interaction inside a real application.

> **Subject requirements:**
> - Create an immersive 3D environment.
> - Implement advanced rendering techniques.
> - Ensure smooth performance and user interaction.

---

> ⚠️ **[DRAFT — RISK ASSESSMENT AND ALTERNATIVES — Remove this section before evaluation]**
>
> ### Risk Assessment of Core Modules
>
> | Module | Risk | Mitigation |
> |---|---|---|
> | DevOps Major 3 (microservices) | Adds operational complexity (service discovery, inter‑service communication, debugging). | Start as a "modular monolith" and extract only critical services (payments, notifications) once the base is stable. |
> | Gaming Major 5 (3D graphics) | Time‑consuming (performance, asset pipeline, browser quirks); risky if team has limited WebGL experience. | Begin with small, isolated 3D previews; keep a 2D fallback; only expand scope if time allows. |
> | Module of Choice (payments) | External provider integration, webhooks, and edge cases may exceed estimates. | Start with a sandbox integration and minimal happy-path flow; use a feature flag to fall back to "manual payment" if needed. |
>
> ### Why the Alternative Modules Are Good Substitutes
>
> - **Web Major 3 – User interaction (chat, profiles, friends):** Leverages the same real‑time infrastructure as Web Major 2 and User Major 1. Can be scoped to simple messaging if 3D or payments become too risky. A natural marketplace social layer (2 pts).
> - **Web Major 4 – Public API:** Builds on the existing data model and REST layer with no new infrastructure. Easier to implement than microservices or 3D, yet still demonstrates API design and security skills (2 pts).
> - **Web Minor 9 – Advanced search:** Adds high user value (filters, sorting, pagination) with contained backend and UI complexity. Can replace or complement a delayed 3D or analytics effort (1 pt).
> - **User Minor 2 – OAuth 2.0:** Self‑contained, clearly demonstrable, and improves UX and security without touching other modules. Ideal fallback if payments or microservices slip (1 pt).
> - **User Minor 4 – User activity analytics dashboard:** Uses data already produced by the platform (orders, visits, listings). Produces visible value via charts and is a natural fit for lmaes's data science role (1 pt).
> - **AI Minor 1 – Content moderation AI:** Narrow and well‑scoped (e.g. auto‑flagging item descriptions and reviews). Can be implemented late in the project and clearly demonstrates AI integration alongside the team's data science skillset (1 pt).

---

> ⚠️ **[DRAFT — FULL DESCRIPTION OF MODULES — Remove this section before evaluation]**
>
> These are the full descriptions of the modules chosen for this project, as defined in the official subject.
>
> ### Core Modules
>
> #### Web Major 1
>
> **Major**: Use a framework for both the frontend and backend.
>
> * Use a frontend framework (React, Vue, Angular, Svelte, etc.).
> * Use a backend framework (Express, NestJS, Django, Flask, Ruby on Rails,
>   etc.).
> * Full-stack frameworks (Next.js, Nuxt.js, SvelteKit) count as both if you use
>   both their frontend and backend capabilities.
>
> #### Web Major 2
>
> **Major**: Implement real-time features using WebSockets or similar technology.
>
> * Real-time updates across clients.
> * Handle connection/disconnection gracefully.
> * Efficient message broadcasting.
>
> #### Web Minor 4
>
> **Minor**: A complete notification system for all creation, update, and deletion ac-
> tions.
>
> #### Web Minor 10
>
> **Minor**: File upload and management system.
>
> * Support multiple file types (images, documents, etc.).
> * Client-side and server-side validation (type, size, format).
> * Secure file storage with proper access control.
> * File preview functionality where applicable.
> * Progress indicators for uploads.
> * Ability to delete uploaded files.
>
> #### User Major 1
>
> **Major**: Standard user management and authentication.
>
> * Users can update their profile information.
> * Users can upload an avatar (with a default avatar if none provided).
> * Users can add other users as friends and see their online status.
> * Users have a profile page displaying their information.
>
> #### User Major 2
>
> **Major**: Advanced permissions system:
>
> * View, edit, and delete users (CRUD).
> * Roles management (admin, user, guest, moderator, etc.).
> * Different views and actions based on user role.
>
> #### Module of Choice
>
> **Major**: Implement a custom module that is not listed above.
>
> * The module must be substantial and demonstrate technical complexity.
> * You must provide proper justification in your README.md explaining:
>
>   * Why you chose this module.
>   * What technical challenges it addresses.
>   * How it adds value to your project.
>   * Why it deserves Major module status (2 points).
> * Taking shortcuts or implementing trivial features will result in rejection.
> * Be creative and think outside the box.
> * The module should be relevant to your project context.
>
> **Minor**: Same as the major module but smaller in scope and less complex.
>
> * Must still demonstrate technical skill and creativity.
> * Should add meaningful value to your project.
> * Requires justification in README.md (similar to Major, but for 1 point).
>
> [◦ List of all chosen modules (Major and Minor).
> ◦ Point calculation (Major = 2pts, Minor = 1pt).
> ◦ Justification for each module choice, especially for custom "Modules of
> choice".
> ◦ How each module was implemented.
> ◦ Which team member(s) worked on each module.]
>
> #### DevOps Major 3
>
> **Major**: Backend as microservices.
>
> * Design loosely-coupled services with clear interfaces.
> * Use REST APIs or message queues for communication.
> * Each service should have a single responsibility.
>
> #### Gaming Major 5
>
> **Major**: Implement advanced 3D graphics using a library like Three.js or Baby-
> lon.js.
>
> * Create an immersive 3D environment.
> * Implement advanced rendering techniques.
> * Ensure smooth performance and user interaction.
>
> ### Extra & Potential Alternative Modules
>
> #### Web Major 3
>
> **Major**: Allow users to interact with other users. The minimum requirements are:
>
> * A basic chat system (send/receive messages between users).
> * A profile system (view user information).
> * A friends system (add/remove friends, see friends list).
>
> #### Web Major 4
>
> **Major**: A public API to interact with the database with a secured API key, rate
> limiting, documentation, and at least 5 endpoints:
> ◦ GET /api/{something}
> ◦ POST /api/{something}
> ◦ PUT /api/{something}
> ◦ DELETE /api/{something}
>
> #### Web Minor 9
>
> **Minor**: Implement advanced search functionality with filters, sorting, and pagina-
> tion.
>
> #### User Minor 2
>
> **Minor**: Implement remote authentication with OAuth 2.0 (Google, GitHub, 42,
> etc.).
>
> #### User Minor 4
>
> **Minor**: User activity analytics and insights dashboard.
>
> #### AI Minor 1
>
> **Minor**: Content moderation AI (auto moderation, auto deletion, auto warning,
> etc.)

---

## Individual Contributions

> ⚠️ **[DRAFT — Fill as implementation progresses and complete]**
>
> For each team member, document:
> - Modules and features they implemented.
> - Specific components or services they owned.
> - Challenges faced and how they were resolved.
>
> **Template:**
>
> - **Ricardo – rda-cunh**: Led product backlog and release planning. Implemented [X, Y]. Challenge: […], solution: […].
> - **Raphael – rapcampo**: Organized sprints and managed delivery. Implemented [X, Y]. Challenge: […], solution: […].
> - **Leonardo V. – lvichi**: Defined architecture and managed DevOps pipeline. Implemented [X, Y]. Challenge: […], solution: […].
> - **Erik – ecarvalh**: Led frontend architecture and UI. Implemented [X, Y]. Challenge: […], solution: […].
> - **Leonardo M. – lmaes**: Designed database schema and data modules. Implemented [X, Y]. Challenge: […], solution: […].

