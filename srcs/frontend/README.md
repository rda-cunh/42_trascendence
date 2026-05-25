# GameAsset Hub (frontend)

React 18 + Vite 6 + TypeScript SPA for the Transcendence marketplace.

## Setup

```bash
npm install
npm run dev
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL (default: `/api`). Vite dev server proxies `/api` and `/images` to the backend. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for checkout (required for payments). |

Example `.env`:

```
VITE_API_URL=/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run type-check` — TypeScript check
- `npm run lint` — ESLint

See [ARCHITECTURE.md](./ARCHITECTURE.md) for feature layout and import rules.
