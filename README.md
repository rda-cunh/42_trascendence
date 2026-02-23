# Transcendence

*This project has been created as part of the 42 curriculum by ecarvalh, lmaes, lvichi, rapcampo and rda-cunh.*

## Description

Transcendence is a project at 42 School aimed at familiarizing students with web development by creating a complete fullstack framework.

[Clearly presents the project, including its goal and a brief overview. The “Description” section should also contain a clear name for the project and its
key features.]

## Instructions

[section containing any relevant information about compilation, installation, and/or execution.]

## Resources

[section listing classic references related to the topic (documentation, articles, tutorials, etc.), as well as a description of how AI was used —
specifying for which tasks and which parts of the project. The “Instructions” section should mention all the needed prerequisites (software,
tools, versions, configuration like .env setup, etc.), and step-by-step instructions to
run the project.]

## Team Information

- Ricardo Mendes - rda-cunh - Product Owner (PO) / Full-Stack Developer
- Raphael Vieira - rapcampo - Project Manager (PM) / Backend Developer
- Leonardo Vichi - lvichi - Technical Lead / DevOps Engineer
- Erik Lustosa - ecarvalh - Front End Lead
- Leonardo Maes - lmaes - Data Science Engineer

[Add a Brief description of responsibilities.]

### Marketplace Platform Description

**Marketplace Platform**: Buy and sell items, with user ratings, messaging, pay-
ment integration, and search functionality.
- Suggested modules: User interaction, File upload, Advanced search, Recom-
mendation system, Public API
- Point potential: 14+ points

## Project Management

### Scheduled meetings and planned sessions:

| Date | Topic |
| --- | --- |
| 2026-02-04 | Discussion of viable projects and general ideas |
| 2026-02-12 | Discussion of Marketplace project with new member |
| 2026-02-17 | Final member added and discussion of roles and modules to tackle |
| 2026-02-20 | Creation of Github repo, readme, and general skeleton of the project |

### Tools

- **Meetings**: Weekly, with sprints Agile structure
- **Communication**: Discord, WhatApp
- **Task Organization**: Github Issues, Independant Documentation
- **Code Review**: Github PRs
- **Containerization Solution**: Docker

[How the team organized the work (task distribution, meetings, etc.).
◦ Tools used for project management (GitHub Issues, Trello, etc.).
◦ Communication channels used (Discord, Slack, etc.).]

## Technical Stack

[Frontend technologies and frameworks used.
◦ Backend technologies and frameworks used.
◦ Database system and why it was chosen.
◦ Any other significant technologies or libraries.
◦ Justification for major technical choices.]


## Database Schema

[◦ Visual representation or description of the database structure.
◦ Tables/collections and their relationships.
◦ Key fields and data types.]

## Features List

[◦ Complete list of implemented features.
◦ Which team member(s) worked on each feature.
◦ Brief description of each feature’s functionality.]

## Modules

### Marketplace Platform Description

**Marketplace Platform**: Buy and sell items, with user ratings, messaging, pay-
ment integration, and search functionality.
- Suggested modules: User interaction, File upload, Advanced search, Recom-
mendation system, Public API
- Point potential: 14+ points

### Proposed Project and Modules

Points will be calculated based on decided modules as x/y (read as “x points out of y maximum for all modules we consider for possible implementation”).

### Proposed Project and Modules

Points will be calculated based on decided modules as x/y (read as “x points out of y maximum for all modules we consider for possible implementation”).

#### Core Modules (High and Medium Priority)

These are the modules we actively plan to implement for our Marketplace MVP. They are selected to provide a complete marketplace experience (frameworks, real‑time, uploads, users, roles, payments, notifications, and 3D previews).

| Module Name | Description | Priority | Points | Page |
| --- | --- | --- | --- | --- |
| [Web Major 1](#web-major-1) | Use a framework for both frontend and backend | High | 2 | 12 |
| [Web Major 2](#web-major-2) | Implement real-time features using WebSockets or similar | High | 2 | 12 |
| [Web Minor 4](#web-minor-4) | Complete notification system for creation, update, and deletion actions | Medium | 1 | 12 |
| [Web Minor 10](#web-minor-10) | File upload and management system | High | 1 | 13 |
| [User Major 1](#user-major-1) | Standard user management and authentication | High | 2 | 14 |
| [User Major 2](#user-major-2) | Advanced permission system (roles and access control) | High | 2 | 14 |
| [Module of Choice](#module-of-choice) | Payment system for the Marketplace | High | 1–2 | 20 |
| [DevOps Major 3](#devops-major-3) | Backend as microservices | High | 2 | 19 |
| [Gaming Major 5](#gaming-major-5) | Advanced 3D graphics (shader previews) | Medium | 2 | 17 |
| **Total** | **15–16 |  |  |  |

#### Extra & Potential Alternative Modules

These modules are candidates for later sprints or for replacing riskier modules if needed. They focus on improving user experience, integrations, analytics, and AI features for the Marketplace.

| Module Name | Description | Priority | Points | Page |
| --- | --- | --- | --- | --- |
| [Web Major 3](#web-major-3) | Allow users to interact with each other (chat, profiles, friends) | Optional | 2 | 12 |
| [Web Major 4](#web-major-4) | Public API with secured access, rate limiting, and documentation | Optional | 2 | 12 |
| [Web Minor 9](#web-minor-9) | Advanced search with filters, sorting, and pagination | Optional | 1 | 12 |
| [User Minor 2](#user-minor-2) | Implement remote authentication with OAuth 2.0 (Google, GitHub, 42) | Low | 1 | 14 |
| [User Minor 4](#user-minor-4) | User activity analytics and insights dashboard | Low | 1 | 14 |
| [AI Minor 1](#ai-minor-1) | Content moderation AI (auto‑flagging shaders and reviews) | Low | 1 | 15 |

### Full Description of Modules

These are the full descriptions of the modules chosen for this project, as defined in the official subject.~

### Core Modules

#### Web Major 1

**Major**: Use a framework for both the frontend and backend.
- Use a frontend framework (React, Vue, Angular, Svelte, etc.).
- Use a backend framework (Express, NestJS, Django, Flask, Ruby on Rails,
etc.).
- Full-stack frameworks (Next.js, Nuxt.js, SvelteKit) count as both if you use
both their frontend and backend capabilities.

#### Web Major 2

**Major**: Implement real-time features using WebSockets or similar technology.
- Real-time updates across clients.
- Handle connection/disconnection gracefully.
- Efficient message broadcasting.

#### Web Minor 4

**Minor**: A complete notification system for all creation, update, and deletion ac-
tions.

#### Web Minor 10

**Minor**: File upload and management system.
- Support multiple file types (images, documents, etc.).
- Client-side and server-side validation (type, size, format).
- Secure file storage with proper access control.
- File preview functionality where applicable.
- Progress indicators for uploads.
- Ability to delete uploaded files.

#### User Major 1

**Major**: Standard user management and authentication.
- Users can update their profile information.
- Users can upload an avatar (with a default avatar if none provided).
- Users can add other users as friends and see their online status.
- Users have a profile page displaying their information.

#### User Major 2

**Major**: Advanced permissions system:
- View, edit, and delete users (CRUD).
- Roles management (admin, user, guest, moderator, etc.).
- Different views and actions based on user role.

#### Module of Choice

**Major**: Implement a custom module that is not listed above.
- The module must be substantial and demonstrate technical complexity.
- You must provide proper justification in your README.md explaining:
  - Why you chose this module.
  - What technical challenges it addresses.
  - How it adds value to your project.
  - Why it deserves Major module status (2 points).
- Taking shortcuts or implementing trivial features will result in rejection.
- Be creative and think outside the box.
- The module should be relevant to your project context.

**Minor**: Same as the major module but smaller in scope and less complex.
- Must still demonstrate technical skill and creativity.
- Should add meaningful value to your project.
- Requires justification in README.md (similar to Major, but for 1 point).

[◦ List of all chosen modules (Major and Minor).
◦ Point calculation (Major = 2pts, Minor = 1pt).
◦ Justification for each module choice, especially for custom "Modules of
choice".
◦ How each module was implemented.
◦ Which team member(s) worked on each module.]

#### DevOps Major 3

**Major**: Backend as microservices.
- Design loosely-coupled services with clear interfaces.
- Use REST APIs or message queues for communication.
- Each service should have a single responsibility.

#### Gaming Major 5

**Major**: Implement advanced 3D graphics using a library like Three.js or Baby-
lon.js.
- Create an immersive 3D environment.
- Implement advanced rendering techniques.
- Ensure smooth performance and user interaction.

### Extra & Potential Alternative Modules

#### Web Major 3

**Major**: Allow users to interact with other users. The minimum requirements are:
- A basic chat system (send/receive messages between users).
- A profile system (view user information).
- A friends system (add/remove friends, see friends list).

#### Web Major 4

**Major**: A public API to interact with the database with a secured API key, rate
limiting, documentation, and at least 5 endpoints:
◦ GET /api/{something}
◦ POST /api/{something}
◦ PUT /api/{something}
◦ DELETE /api/{something}

#### Web Minor 9

**Minor**: Implement advanced search functionality with filters, sorting, and pagina-
tion.

#### User Minor 2

**Minor**: Implement remote authentication with OAuth 2.0 (Google, GitHub, 42,
etc.).

#### User Minor 4

**Minor**: User activity analytics and insights dashboard.

#### AI Minor 1

**Minor**: Content moderation AI (auto moderation, auto deletion, auto warning,
etc.)


## Individual Contributions

[◦ Detailed breakdown of what each team member contributed.
◦ Specific features, modules, or components implemented by each person.
◦ Any challenges faced and how they were overcome.]




