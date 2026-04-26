# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

Set `ANTHROPIC_API_KEY` in `.env` to use real Claude; omit it to use the mock provider (generates static code).

## Architecture

**UIGen** is a full-stack Next.js 15 app where users describe React components in a chat interface and receive AI-generated code with a live preview.

### Request Flow

1. User types a prompt in `components/chat/ChatInterface.tsx`
2. The `ChatProvider` (`lib/contexts/`) streams to `POST /api/chat`
3. `app/api/chat/route.ts` calls `streamText` (Vercel AI SDK) with the system prompt from `lib/prompts/generation.tsx`
4. Claude uses two tools: `str_replace_editor` and `file_manager` (defined in `lib/tools/`) to create/edit files
5. Tool calls update the virtual file system (`lib/file-system.ts`) held in `FileSystemContext`
6. `components/preview/PreviewFrame.tsx` re-renders the component live

### Key Abstractions

**Virtual File System** (`lib/file-system.ts`) — In-memory file system (no disk writes). State is serialized to JSON and stored in the `Project.filesJson` column in SQLite. All file operations go through this layer.

**AI Provider** (`lib/provider.ts`) — Wraps `@ai-sdk/anthropic`. Uses Claude Haiku 4.5 with prompt caching enabled (`experimental_providerMetadata` with `anthropic: { cacheControl: { type: 'ephemeral' } }`). Falls back to a mock provider (returns static code) when `ANTHROPIC_API_KEY` is missing. Max 40 tool-calling steps (4 for mock).

**Authentication** (`lib/auth.ts`) — Email/password auth with bcrypt + JWT (jose). Anonymous users are fully supported; the `userId` field on `Project` is optional. Anonymous session limits are tracked in `lib/anon-work-tracker.ts`.

**Persistence** — Prisma with SQLite (`prisma/dev.db`). Schema has two models: `User` and `Project`. Chat history is stored as `messagesJson` (JSON string) and the file system as `filesJson` (JSON string) on the Project model.

### Layout

`src/app/main-content.tsx` renders the two-panel layout (via `react-resizable-panels`): chat on the left, preview/code editor on the right. Switching between preview and code is a tab toggle — not a route change.

### Path Aliases

`@/*` maps to `src/*` (tsconfig paths).

## Code Style

- Use comments sparingly — only when the logic is complex and non-obvious. Skip comments on straightforward code.