# CareVoice — Agent Instructions

## Project Overview

CareVoice is a healthcare voice data processing monorepo. It processes voice-transcribed medical data through AI extraction, encrypts sensitive fields with AES-256-GCM, and serves decrypted data to clinicians via a Next.js frontend.

## Monorepo Structure

- `apps/api` — Hono-based core API. Handles DAR processing, Whisper/GPT-4o extraction, and AES-256 encryption before DB writes.
- `apps/bff` — Hono-based backend-for-frontend. Decrypts data from the core API and serves it to the React frontend.
- `apps/web` — Next.js 14 App Router frontend with Tailwind CSS.
- `packages/crypto` — Shared AES-256-GCM encryption/decryption utilities.
- `packages/types` — Shared TypeScript interfaces (DARRecord, EncryptedDARRecord).
- `supabase/` — SQL migrations and RLS policies.

## Key Patterns

- All apps use Bun as the runtime.
- Turborepo orchestrates builds, linting, and type-checking across the monorepo.
- The `@carevoice/*` workspace packages are referenced via `workspace:*` protocol.
- Environment variables are validated at runtime; never hardcode secrets.
- The API encrypts data before storage; the BFF decrypts before serving to the client.

## Conventions

- TypeScript strict mode is enabled in all packages.
- Use `export default` for Hono app instances.
- Error responses follow the `{ error: string, message: string }` shape.
- All route handlers return proper HTTP status codes (200, 400, 401, 500).
- Structured logging uses `console.warn` for warnings and `console.error` for errors.

## Running Tasks

| Task | Command |
|---|---|
| Dev all apps | `bun run dev` |
| Build all | `bun run build` |
| Lint all | `bun run lint` |
| Format all | `bun run format` |
| Type-check all | `bun run typecheck` |
| Test all | `bun run test` |

## Testing

Tests live alongside source files as `*.test.ts`. Run with `bun test`.