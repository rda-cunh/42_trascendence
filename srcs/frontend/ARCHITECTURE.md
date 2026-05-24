# Frontend architecture

The app under `src/app/` is organized by **feature**, not by file type.

## Layers

| Layer | Path | Purpose |
|-------|------|---------|
| **core** | `core/` | App bootstrap: contexts, API client, shared types, route guards |
| **features** | `features/<name>/` | Domain UI: pages, feature components, feature hooks |
| **shared** | `shared/` | Cross-feature shell: layout, header, legal pages, utils |

## Import rules

- Use the `@/app/...` alias (maps to `src/app/...`).
- Features may import from `core/` and `shared/`.
- Features should **not** import from other features’ internals; use `shared/` or lift shared code to `core/`.
- Within a feature, relative imports (`../components/...`) are fine.

## Where to put new code

| Adding… | Location |
|---------|----------|
| New marketplace screen | `features/products/pages/` or `features/listings/pages/` |
| Component for one feature | `features/<feature>/components/` |
| Header / footer / toast | `shared/components/` |
| API call | `core/lib/` (domain module or `api.ts`) |
| Global React context | `core/contexts/` |
| Type used app-wide | `core/types/` |

## Features

- **products** — browse, product detail, seller profile
- **listings** — create / edit listings
- **cart** — cart drawer
- **checkout** — checkout flow
- **chat** — messaging
- **auth** — login, register, OAuth
- **profile** — account, orders
- **admin** — moderation dashboard

## Entry points

- `src/main.tsx` — React root
- `src/app/App.tsx` — providers
- `src/app/routes.tsx` — route table only
