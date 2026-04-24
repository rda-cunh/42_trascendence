# Module Review for Team Meeting

These tables summarize the current module strategy for the project based on progress, implementation risk, and delivery value.

## Must have / under development

| Module | Points | Current status | Module lead (person names) | Why it stays | Decision |
|---|---:|---|---|---|---|
| **Web Major 1 – Framework for frontend and backend** | 2 | Under development | [All] | Foundation of the whole project and already in progress. | **Keep** |
| **User Major 1 – Standard user management and authentication** | 2 | Backend implemented, frontend missing | [Raphael + Ricardo + Erick] | Strong progress already; core requirement for the app. | **Keep** |
| **User Major 2 – Advanced permission system** | 2 | 3 roles already defined | [Raphael + Leonardo Maes] | Fits marketplace logic and reuses auth work. | **Keep** |
| **Web Minor 10 – File upload and management system** | 1 | Planned / needed for pictures | [Raphael + Leonardo Maes + Leonardo Vichi] | Important for listings, assets, and marketplace usability. | **Keep** |
| **User Minor 2 – Remote authentication with OAuth 2.0** | 1 | Backend already implemented | [Ricardo + Erik] | Cheap point because much of the backend work exists already. | **Keep** |
| **Web Major 3 – User interaction (chat, profiles, friends)** | 2 | Chat already being discussed/planned | [Ricardo + Erik] | Reuses users/auth and is easy to demo clearly. | **Keep** |
| **Web Major 2 – Real-time features** | 2 | Chat idea exists | [TBD: Ricardo + Erik] | Good only if clearly separated from user interaction and truly real-time across clients. | **Check if is comulative** |
| **DevOps Monitoring module – Prometheus + Grafana** | 2 | DevOps teammate is working on it | [Leonardo Vichi] | Better than microservices because it is more realistic and demonstrable if progress is real. | **Keep** |
| **Total** | **14** |  |  |  |  |

## Best choices to add

| Module | Points | Current status | Module lead (person names) | Why it is a good choice now | Decision |
|---|---:|---|---|---|---|
| **Web Major 4 – Public API** | 2 | Endpoints already prepared to support it | [TBD: Raphael + Leonardo Vichi] | Good marketplace fit and easier to justify than microservices. | **High priority add** |
| **Web Minor 4 – Notification system** | 1 | Not started | [TBD: Raphael + Ricardo] | Useful for a marketplace, but best as a backup if easy to derive from backend events. | **Backup candidate** |
| **Total if all chosen** | **8–9** |  |  |  |  |

## Drop for now

| Module | Points | Current status | Module lead (person names) | Why it should be dropped now | Decision |
|---|---:|---|---|---|---|
| **DevOps Major 3 – Backend as microservices** | 2 | Not implemented | [N/A – dropping] | High complexity, no progress, and team already wants to drop it. | **Drop** |
| **Module of Choice – Payment system for the marketplace** | 1–2 | Not implemented | [N/A – dropping] | Adds custom justification burden and full purchase-flow complexity. | **Drop** |
| **Gaming Major 5 – Advanced 3D graphics** | 2 | No demo shown yet | [N/A – dropping] | Frontend-heavy and risky with no visible group progress yet. | **Drop unless immediate progress appears** |
| **Web Minor 9 – Advanced search** | 1 | Not implemented | [N/A – dropping] | You already said it is not a good idea right now, so it should leave the shortlist. | **Drop for now** |
| **User Minor 4 – User activity analytics** | 1 | Not implemented | [N/A – dropping] | Not necessary for your rescue plan and no current progress. | **Drop** |
| **AI Minor 1 – Content moderation AI** | 1 | Not implemented | [N/A – dropping] | Adds complexity without helping the core delivery target. | **Drop** |
| **DevOps Major 1 – ELK / log management** | 2 | Not started | [N/A – dropping] | Lower priority and less realistic than the monitoring work already underway. | **Drop** |
| **Total dropped** | **10–11** |  |  |  |  |
