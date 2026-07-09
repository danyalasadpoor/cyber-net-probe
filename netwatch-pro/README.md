# NetWatch Pro

Premium offline-first network monitoring dashboard. Pure React 19 + Vite SPA, wrapped with Capacitor for Android.

## Quick start

```bash
npm install
npm run dev          # web preview at :5173
npm run build        # emits ./dist (SPA)
```

## Android

```bash
npx cap init         # only if capacitor.config.ts is missing (it is included)
npx cap add android
npm run build
npx cap sync android
npx cap open android
```

## Stack

- React 19 + TypeScript + Vite (SPA only, no SSR)
- React Router DOM
- Tailwind CSS
- Zustand (settings + logs stores)
- Recharts (analytics)
- @capacitor-community/sqlite (native) with jeep-sqlite web fallback
- @capacitor/network, filesystem, preferences, share

## Architecture

```
src/
  lib/       db, scanner engine, logger, export, utils
  store/     zustand stores
  components/  Layout, Sidebar, TopBar, GlassCard, StatCard, ui/
  pages/     Dashboard, Targets, Scanner, Logs, Analytics, History, Settings
  types/     shared types
```

The SQLite schema is indexed for 200k+ targets. All operations are paginated and use prepared statements.
