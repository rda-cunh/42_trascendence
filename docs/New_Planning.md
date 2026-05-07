# Module Review for Team Meeting

These tables summarize the current module strategy for the project based on progress, implementation risk, and delivery value. Module names in the tables link to detailed notes below.

## Must have / under development

| Module | Points | Current status | Module lead (person names) | Notes / Decisions |
|---|---:|---|---|---|
| [**Web Major 1 – Framework for frontend and backend**](#web-major-1--framework-for-frontend-and-backend) | 2 | **Completed** | All | Foundation of the whole project. **Completed.** |
| [**User Major 1 – Standard user management and authentication**](#user-major-1--standard-user-management-and-authentication) | 2 | Features missing | **Raphael** + Ricardo + Erik | TO DO: upload avatar; add user as friends and online status; profile page **Keep.** |
| [**User Major 2 – Advanced permission system**](#user-major-2--advanced-permission-system) | 2 | Features Missing | **Raphael** + Leonardo Maes | TO DO: view, edit and delete users; diffent views based on role. **Keep.** |
| [**Web Minor 9 – Advanced search**](#web-minor-9--advanced-search) | 1 | Frontend Missing | **Leonardo** + Rapahel + Erik | Cheap point because much of the backend work exists already. **Keep.** |
| [**User Minor 2 – Remote authentication with OAuth 2.0**](#user-minor-2--remote-authentication-with-oauth-20) | 1 | Frontend Missing | **Ricardo** + Erik | Cheap point because much of the backend work exists already. **Keep.** |
| [**Web Major 3 – User interaction (chat, profiles, friends)**](#web-major-3--user-interaction-chat-profiles-friends) | 2 | Features missing | **Ricardo** + Erik | TO DO: Improve chat; profile system and user info; friend system; user profile. **Keep.** |
| [**Web Major 2 – Real-time features**](#web-major-2--real-time-features) | 2 | Features missing | **Ricardo** + Erik | TO DO: Chat, online status, notifications (?). **Check if cumulative.** |
| [**DevOps Monitoring module – Prometheus + Grafana**](#devops-monitoring-module--prometheus--grafana) | 2 | PR for validation | **Leonardo Vichi** | Better than microservices because it is more realistic and demonstrable if progress is real. **Keep.** |
| **Total** | **14** |  |  |  |

## Best choices to add

| Module | Points | Current status | Module lead (person names) | Notes / Decisions |
|---|---:|---|---|---|
| [**Web Major 4 – Public API**](#web-major-4--public-api) | 2 | Endpoints already prepared to support it | [TBD: Raphael + Leonardo Vichi] | Good marketplace fit and easier to justify than microservices. **High priority add.** |
| [**Web Minor 4 – Notification system**](#web-minor-4--notification-system) | 1 | Not started | [TBD: Raphael + Ricardo] | Useful for a marketplace, but best as a backup if easy to derive from backend events. **Backup candidate.** |
| **Total if all chosen** | **8–9** |  |  |  |

## Drop for now

| Module | Points | Current status | Module lead (person names) | Notes / Decisions |
|---|---:|---|---|---|
| [**Web Minor 10 – File upload and management system**](#web-minor-10--file-upload-and-management-system) | 1 | Planned / needed for pictures initially | [N/A – dropping] | Important for listings, assets, and marketplace usability, but adds complexity. **Drop.** |
| [**DevOps Major 3 – Backend as microservices**](#devops-major-3--backend-as-microservices) | 2 | Not implemented | [N/A – dropping] | High complexity, no progress, and team already wants to drop it. **Drop.** |
| [**Module of Choice – Payment system for the marketplace**](#module-of-choice--payment-system-for-the-marketplace) | 1–2 | Not implemented | [N/A – dropping] | Adds custom justification burden and full purchase-flow complexity. **Drop.** |
| [**Gaming Major 5 – Advanced 3D graphics**](#gaming-major-5--advanced-3d-graphics) | 2 | No demo shown yet | [N/A – dropping] | Frontend-heavy and risky with no visible group progress yet. **Drop unless immediate progress appears.** |
| [**User Minor 4 – User activity analytics**](#user-minor-4--user-activity-analytics) | 1 | Not implemented | [N/A – dropping] | Not necessary for your rescue plan and no current progress. **Drop.** |
| [**AI Minor 1 – Content moderation AI**](#ai-minor-1--content-moderation-ai) | 1 | Not implemented | [N/A – dropping] | Adds complexity without helping the core delivery target. **Drop.** |
| [**DevOps Major 1 – ELK / log management**](#devops-major-1--elk--log-management) | 2 | Not started | [N/A – dropping] | Lower priority and less realistic than the monitoring work already underway. **Drop.** |
| **Total dropped** | **10–11** |  |  |  |

## Must have / under development details

### Web Major 1 – Framework for frontend and backend

**Module number and name:** Web Major 1 – Framework for frontend and backend

**Justification:** This is the base of the whole application and is already under development. It also aligns directly with the project requirement to build a real web application with a frontend, backend, and database.

**Requirements from the subject:**
- Use a framework for both the frontend and backend.
- Acceptable frontend examples include React, Vue, Angular, and Svelte.
- Acceptable backend examples include Express, NestJS, Django, Flask, and Ruby on Rails.
- Full-stack frameworks such as Next.js, Nuxt.js, and SvelteKit count for both if both frontend and backend capabilities are used.

### User Major 1 – Standard user management and authentication

**Module number and name:** User Major 1 – Standard user management and authentication

**Justification:** This module is already partially implemented and is a core building block for a marketplace-style application. It also reinforces the mandatory technical requirement for secure signup and login.

**Requirements from the subject:**
- Users can update their profile information.
- Users can upload an avatar, with a default avatar if none is provided.
- Users can add other users as friends and see their online status.
- Users have a profile page displaying their information.

### User Major 2 – Advanced permission system

**Module number and name:** User Major 2 – Advanced permission system

**Justification:** The project already has role definitions, so this module builds on existing work. It is also useful for marketplace logic where different types of users need different actions and views.

**Requirements from the subject:**
- View, edit, and delete users (CRUD).
- Roles management such as admin, user, guest, moderator, etc.
- Different views and actions based on user role.

### Web Minor 9 – Advanced search

**Module number and name:** Web Minor 9 – Advanced search

**Justification:** Advanced search can be useful in a marketplace, and can ensure a quick win

**Requirements from the subject:**
- Implement advanced search functionality with filters, sorting, and pagination.

### User Minor 2 – Remote authentication with OAuth 2.0

**Module number and name:** User Minor 2 – Remote authentication with OAuth 2.0

**Justification:** Much of the backend work is already implemented, which makes this a low-risk point. It also improves user onboarding and complements the base authentication module.

**Requirements from the subject:**
- Implement remote authentication with OAuth 2.0.
- Examples include Google, GitHub, and 42 authentication providers.

### Web Major 3 – User interaction (chat, profiles, friends)

**Module number and name:** Web Major 3 – User interaction (chat, profiles, friends)

**Justification:** This module fits well with a social or marketplace direction and reuses the user system already being built. It is also easy to show during evaluation because the features are concrete and interactive.

**Requirements from the subject:**
- Implement a basic chat system to send and receive messages between users.
- Implement a profile system to view user information.
- Implement a friend system to add and remove friends and see the friends list.

### Web Major 2 – Real-time features

**Module number and name:** Web Major 2 – Real-time features

**Justification:** Real-time behavior can strengthen chat and other live interactions, but it should only stay if it is clearly distinct from the user interaction module. The team should confirm that the implementation and evaluation scope are separate enough.

**Requirements from the subject:**
- Implement real-time features using WebSockets or similar technology.
- Provide real-time updates across clients.
- Handle connection and disconnection gracefully.
- Support efficient message broadcasting.

### DevOps Monitoring module – Prometheus + Grafana

**Module number and name:** DevOps Major 2 – Monitoring system with Prometheus and Grafana

**Justification:** This is more realistic than microservices and is already being worked on by the DevOps side. It is also demonstrable during evaluation through dashboards, metrics, and alerting.

**Requirements from the subject:**
- Set up Prometheus to collect metrics.
- Configure exporters and integrations.
- Create custom Grafana dashboards.
- Set up alerting rules.
- Secure access to Grafana.

## Best choices to add details

### Web Major 4 – Public API

**Module number and name:** Web Major 4 – Public API

**Justification:** This is a strong fit for a marketplace because it opens the project to structured external use and is easier to justify than microservices. If the endpoints are already close to ready, it is a practical high-priority add.

**Requirements from the subject:**
- Provide a public API to interact with the database.
- Secure the API with an API key.
- Add rate limiting.
- Add documentation.
- Include at least 5 endpoints, including GET, POST, PUT, and DELETE operations.

### Web Minor 4 – Notification system

**Module number and name:** Web Minor 4 – Notification system

**Justification:** Notifications are useful in a marketplace and can improve the user experience, but they should be treated as a backup if the underlying events are already available. This keeps the team focused on higher-value modules first.

**Requirements from the subject:**
- Implement a complete notification system for creation, update, and deletion actions.

## Drop for now details

### DevOps Major 3 – Backend as microservices

**Module number and name:** DevOps Major 3 – Backend as microservices

**Justification:** This is high complexity with no implementation progress yet. It adds architecture overhead and testing burden without helping the team secure the most realistic points first.

**Requirements from the subject:**
- Design loosely-coupled services with clear interfaces.
- Use REST APIs or message queues for communication.
- Each service should have a single responsibility.

### Module of Choice – Payment system for the marketplace

**Module number and name:** Module of Choice – Payment system for the marketplace

**Justification:** A payment flow can fit the product idea, but as a module of choice it would require additional README justification and would likely increase security, edge-case, and legal complexity. It is better kept out of the short-term rescue plan.

**Requirements from the subject:**
- The module must be custom and not listed in the official modules.
- It must be substantial and demonstrate technical complexity.
- The README must justify why the module was chosen, what technical challenges it addresses, how it adds value to the project, and why it deserves its point value.

### Gaming Major 5 – Advanced 3D graphics

**Module number and name:** Gaming Major 5 – Advanced 3D graphics

**Justification:** This is risky because it is frontend-heavy and there is no visible demo progress yet. It does not support the current rescue plan as directly as the web and user modules do.

**Requirements from the subject:**
- Implement advanced 3D graphics using a library like Three.js or Babylon.js.
- Create an immersive 3D environment.
- Implement advanced rendering techniques.
- Ensure smooth performance and user interaction.

### Web Minor 10 – File upload and management system

**Module number and name:** Web Minor 10 – File upload and management system

**Justification:** A marketplace needs image and file handling for listings and user content. This module adds visible value and supports a common feature set that is easy to demonstrate.

**Requirements from the subject:**
- Support multiple file types, including images and documents.
- Client-side and server-side validation for type, size, and format.
- Secure file storage with proper access control.
- File preview functionality where applicable.
- Progress indicators for uploads.
- Ability to delete uploaded files.

### User Minor 4 – User activity analytics

**Module number and name:** User Minor 4 – User activity analytics and insights dashboard

**Justification:** This module is not necessary for the current delivery plan and there is no progress on it. It also offers less direct value than the modules already under development.

**Requirements from the subject:**
- Implement user activity analytics and an insights dashboard.

### AI Minor 1 – Content moderation AI

**Module number and name:** AI Minor 1 – Content moderation AI

**Justification:** This introduces extra AI complexity without directly supporting the core project delivery target. It should only be revisited if the core platform is already stable and complete.

**Requirements from the subject:**
- Implement AI-based content moderation, such as automoderation, autodeletion, or autowarning.

### DevOps Major 1 – ELK / log management

**Module number and name:** DevOps Major 1 – Infrastructure for log management using ELK

**Justification:** Log management is useful, but given the current state of the project it is less realistic than the monitoring module already underway. It adds setup and operational work that the team does not currently need for the core plan.

**Requirements from the subject:**
- Use Elasticsearch to store and index logs.
- Use Logstash to collect and transform logs.
- Use Kibana for visualization and dashboards.
- Implement log retention and archiving policies.
- Secure access to all components.
