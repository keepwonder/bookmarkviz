# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BookmarkViz — X (Twitter) bookmark visualization app. Upload a `bookmarks.jsonl` file to get heatmaps, word clouds, author networks, and content analysis of your reading patterns.

## Commands

```bash
npm run dev          # Vite dev server
npm run build        # tsc -b && vite build (type-check + bundle)
npm run lint         # ESLint
npm run preview      # Preview production build
npm run prepare-data # Run scripts/prepare-data.ts with tsx
```

No test framework is configured.

## Architecture

### Frontend (`src/`)

**Routing** (React Router v7, defined in `src/App.tsx`):
- `/` → Landing (public, eager-loaded)
- `/dashboard` → Home (lazy)
- `/explore` → Explore (lazy, full-text search + filters)
- `/collections` → Collections (lazy)
- `/sync` → DataSync (lazy, file upload)
- `/about` → About (lazy)

All routes except Landing are wrapped in `<Layout />` (nav bar, theme/locale toggle, user menu).

**State Management**: React Context only — no Redux/Zustand.
- `src/lib/auth.tsx` — AuthProvider + useAuth (user, login/logout)
- `src/lib/theme.tsx` — ThemeProvider (dark/light/system)
- `src/lib/i18n.tsx` — LocaleProvider (zh/en), translations inline

**Data Flow** (three-tier, see `src/lib/data.ts`):
1. Authenticated → fetch from Cloudflare D1 API (`src/lib/api.ts`)
2. No API data → load from IndexedDB (`src/lib/db.ts`)
3. No local data → fallback to demo JSON (`/public/data/bookmarks.json`)

`src/lib/processor.ts` parses raw JSONL into the `BookmarksData` type and computes analytics (daily counts, word frequencies, author connections, content types). The `BookmarksData` interface is the central data contract.

**Client-side Storage**:
- IndexedDB (`bookmarkviz` database) — bookmark data
- localStorage — collections, notes, read-status, theme, locale preferences
- Modules: `collections.ts`, `notes.ts`, `read-status.ts`

**Charts** (`src/components/charts/`): All ECharts-based — CalendarHeatmap, EngagementRank, ContentTypePie, WordCloud, AuthorGraph, Timeline. Chart theming in `src/lib/chart-theme.ts`.

**Content Fetching** (`src/lib/content-fetcher.ts`): Fetches external article content via Jina Reader API, cached in IndexedDB with 7-day TTL.

### Backend (`functions/`)

Cloudflare Pages Functions (Workers) providing:

- **Auth** (`functions/api/auth/`): GitHub & Google OAuth flow. Sessions via encrypted HTTP-only cookies (`functions/lib/session.ts`). OAuth helpers in `functions/lib/oauth.ts`. Rate limiting in `functions/lib/rate-limit.ts`.
- **API** (`functions/api/`): REST endpoints for bookmarks, collections, notes, read-status, and data migration.
- **Database** (`functions/db/schema.ts`): Cloudflare D1 (SQLite) schema — users, bookmarks, analytics, collections, notes, read_status tables.

### Build Configuration

- Vite 8 with `@vitejs/plugin-react` + `@tailwindcss/vite`
- ECharts and echarts-wordcloud split into separate chunks (`vite.config.ts`)
- TypeScript strict mode with `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`
- Tailwind CSS v4 imported via `@import "tailwindcss"` in `src/index.css`, theming via CSS custom properties

## Key Conventions

- Core data types (`Bookmark`, `Analytics`, `BookmarksData`) live in `src/lib/data.ts`
- Context hooks follow the `use[X]` pattern exported from their provider files
- All page routes use lazy loading except Landing
- Demo data in `/public/data/bookmarks.json` serves as zero-config fallback


## 
添加项目开发过程中的关键节点落地本地文档，包括但不限于：项目启动，添加关键技术、用到的工具节点、顽固错误修复，好的优化建议等等