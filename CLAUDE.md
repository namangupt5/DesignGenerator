# CLAUDE.md

File guides Claude Code (claude.ai/code) when working in this repo.

## Commands

```bash
# Setup (first time)
npm run setup                    # install deps + prisma generate + migrate

# Development
npm run dev                      # Next.js dev server with Turbopack
npm run dev:daemon               # Dev server in background, logs to logs.txt

# Build & Production
npm run build
npm run start

# Testing
npm test                         # run all Vitest tests
npx vitest run src/path/to/file  # run a single test file

# Linting
npm run lint

# Database
npx prisma studio                # GUI for SQLite DB
npm run db:reset                 # reset and re-migrate (destructive)
```

Set `ANTHROPIC_API_KEY` in `.env` for real Claude; omit for mock provider (generates static code).

## Architecture

**UIGen** — full-stack Next.js 15 app. Users describe React components in chat, get AI-generated code + live preview.

### Request Flow

1. User types prompt in `components/chat/ChatInterface.tsx`
2. `ChatProvider` (`lib/contexts/`) streams to `POST /api/chat`
3. `app/api/chat/route.ts` calls `streamText` (Vercel AI SDK) with system prompt from `lib/prompts/generation.tsx`
4. Claude uses two tools: `str_replace_editor` and `file_manager` (defined in `lib/tools/`) to create/edit files
5. Tool calls update virtual file system (`lib/file-system.ts`) held in `FileSystemContext`
6. `components/preview/PreviewFrame.tsx` re-renders component live

### Key Abstractions

**Virtual File System** (`lib/file-system.ts`) — In-memory, no disk writes. State serialized to JSON, stored in `Project.filesJson` column in SQLite. All file ops go through this layer.

**AI Provider** (`lib/provider.ts`) — Wraps `@ai-sdk/anthropic`. Uses Claude Haiku 4.5 with prompt caching (`experimental_providerMetadata` with `anthropic: { cacheControl: { type: 'ephemeral' } }`). Falls back to mock provider when `ANTHROPIC_API_KEY` missing. Max 40 tool-calling steps (4 for mock).

**Authentication** (`lib/auth.ts`) — Email/password auth with bcrypt + JWT (jose). Anonymous users fully supported; `userId` on `Project` optional. Anonymous session limits tracked in `lib/anon-work-tracker.ts`.

**Persistence** — Prisma + SQLite (`prisma/dev.db`). Two models: `User`, `Project`. Chat history stored as `messagesJson`, file system as `filesJson` (both JSON strings) on Project.

### Layout

`src/app/main-content.tsx` renders two-panel layout (via `react-resizable-panels`): chat left, preview/code editor right. Preview/code toggle is tab switch — not route change.

### Path Aliases

`@/*` maps to `src/*` (tsconfig paths).

## Code Style

- Comments only when logic complex + non-obvious. Skip on straightforward code.