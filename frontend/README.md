# Faleme Frontend

React + TypeScript + Vite single-page app for the Faleme lottery dashboard.

## Requirements

- Node.js 20+ (pnpm is pinned via `packageManager`)
- The backend API running at `http://127.0.0.1:8100` (see root `README.md`)

## Scripts

| Command          | Description                     |
| ---------------- | ------------------------------- |
| `pnpm install`   | Install dependencies            |
| `pnpm dev`       | Start Vite dev server with proxy to the backend |
| `pnpm build`     | Type-check and build to `dist/` |
| `pnpm test`      | Run unit tests (vitest)         |
| `pnpm lint`      | Run ESLint                      |

The dev server proxies `/api` requests to `http://127.0.0.1:8100` (see `vite.config.ts`).

## Structure

- `src/components/` — UI components
- `src/hooks/` — data fetching and theme hooks
- `src/i18n/` — zh/en translations
- `src/styles/` — styled-components and theme variables
- `src/utils/` — shared helpers
