# AgriShield AI

AgriShield AI is a mobile-first agricultural decision-support prototype built with React, TypeScript, Vite, and an Express backend. The project models a farmer-facing workflow for field registration, image review, risk preview, advisory guidance, and history tracking, while clearly labeling all data as illustrative and prototype-only rather than operational agronomy intelligence.

This repository contains the client app, authenticated farmer workspace, public marketing site, and a small server API for session/user handling and persisted farm records.

## Overview

AgriShield AI is designed around the following flow:

- Public landing page with product messaging and sign-in entry
- Farmer authentication/session flow
- Field onboarding for farms and crop records
- Image upload intake for crop observations
- Demo diagnosis and risk preview screens
- Advisory and alert views with prototype-only guidance
- History tracking and sample expert/admin previews

The project explicitly avoids claiming that live ML diagnosis, production weather feeds, or pesticide recommendations are connected. Instead, it presents clear demo data and an inconclusive state when evidence is unavailable.

## Tech Stack

- Frontend: React 18 + TypeScript + Vite
- Routing: React Router
- UI: custom CSS, Lucide icons, Recharts
- Backend: Express + TypeScript
- Auth: Manus OAuth-style session flow
- Data: MySQL-compatible database via `mysql2`
- Validation: Zod
- Package manager: pnpm

## Project Structure

```text
agrishield/
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── vite.config.ts
├── tsconfig.json
├── app.config.ts
├── plan.md
├── TODO.md
├── public/
│   ├── manus-routes.json
│   ├── sw.js
│   └── ...
├── scripts/
│   ├── repair_locale.py
│   └── translate_catalog.py
├── server/
│   ├── index.ts
│   ├── auth/
│   ├── db/
│   └── routes/
├── src/
│   ├── App.tsx
│   ├── app/
│   ├── components/
│   ├── data/
│   ├── i18n/
│   ├── lib/
│   ├── pages/
│   ├── main.tsx
│   └── styles.css
└── dist/
```

## Main Features

### Public experience

- Landing page with sections for Home, How it works, Crop examples, and About
- Sign-in route and public product messaging
- Mobile-friendly, accessible layout with translation-ready copy

### Farmer workspace

- Secure session-gated routing for authenticated users
- Farm/field creation and listing
- Crop, growth stage, planting date, and region metadata tracking
- Dashboard for risk and crop situation overview
- Scan/diagnosis entry workflow with image-count validation
- Sample observation recording and history

### Prototype safety model

- No live disease prediction engine is connected
- Unavailable model/weather data results in a clear needs-review state
- Weather, risk, and advisory content are clearly labeled as illustrative
- No pesticide recommendation is generated from humidity or unsupported evidence
- Expert/admin screens are read-only sample previews

### Accessibility and localization

- Browser speech support hook and language switching controls
- Easier reading mode / accessibility utilities
- Multi-language-ready structure with English and regional locale support

## Environment Variables

The server expects a MySQL-compatible database connection through `DATABASE_URL` and uses the following runtime options:

```bash
DATABASE_URL="mysql://user:password@host:3306/agrishield"
PORT=3000
NODE_ENV=development
```

Notes:

- `DATABASE_URL` is required for the app to initialize the schema and data layer.
- Development mode runs the Vite middleware and Express app together.
- Production mode serves the built client from `dist/client`.

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the app in development mode

```bash
pnpm dev
```

This serves the app on the configured port, defaulting to `http://localhost:3000`.

### 3. Type-check the project

```bash
pnpm typecheck
```

### 4. Build for production

```bash
pnpm build
```

### 5. Start the production build

```bash
pnpm start
```

## Scripts

From [package.json](./package.json):

- `pnpm dev` — run the Express + Vite development server
- `pnpm build` — create the production build and copy the database migration file into `dist/server/migrations`
- `pnpm start` — serve the generated production build
- `pnpm typecheck` — run TypeScript checks without emitting output

## API and Server Notes

The backend is defined in [server/index.ts](./server/index.ts) and mounted under `/api` from [server/routes/api.ts](./server/routes/api.ts).

Key routes include:

- `/api/health`
- `/api/auth/session`
- `/api/auth/start`
- `/api/auth/callback`
- `/api/auth/logout`
- `/api/fields`
- `/api/diagnoses` / case-related endpoints
- alert, history, and sample preview APIs

The project uses additive schema migration handling in [server/db/index.ts](./server/db/index.ts), so database setup is versioned and safe for prototype extension.

## Product Status and Disclaimer

This repository represents a prototype and preview experience rather than a production agronomy platform. The implementation intentionally includes disclaimers and safe fallback behavior for:

- missing weather data
- missing model outputs
- unavailable real-time diagnosis
- no chemical treatment recommendations
- read-only expert/admin examples

As stated in the project plan, the app is meant to demonstrate a product direction and UX pattern rather than run a certified agricultural decision system.

## License

This project does not currently include a license file. If you are using this repository for a client project, legal review is recommended before publishing or redistributing it.

## Contributing

This project is structured for local prototype iteration and feature development. To contribute:

1. Create a feature branch.
2. Keep changes aligned with the prototype-safe messaging and disclaimers.
3. Run type checks after code changes.
4. Avoid introducing misleading claims about diagnosis accuracy, weather data, or treatment recommendations.
