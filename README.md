# CareVoice

A healthcare voice data processing platform that transforms voice-transcribed medical data into secure, encrypted records accessible to clinicians.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Next.js 14 │────▶│  Hono BFF   │────▶│  Hono API   │
│   Frontend  │     │  (Decrypt)  │     │  (Encrypt)  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                        ┌──────▼──────┐
                                        │   Supabase  │
                                        │  (Postgres) │
                                        └─────────────┘
```

- **API** (`apps/api`) — Core API built with Hono. Handles DAR processing, Whisper/GPT-4o extraction, and AES-256-GCM encryption before database writes.
- **BFF** (`apps/bff`) — Backend-for-frontend. Decrypts data from the core API and serves it securely to the React frontend.
- **Web** (`apps/web`) — Next.js 14 App Router frontend with Tailwind CSS.
- **Crypto** (`packages/crypto`) — Shared AES-256-GCM encryption/decryption utilities.
- **Types** (`packages/types`) — Shared TypeScript interfaces.

## Quick Start

```bash
# Install dependencies
bun install

# Run all apps in development mode
bun run dev

# Build all packages
bun run build

# Lint all packages
bun run lint

# Format all files
bun run format

# Type-check all packages
bun run typecheck

# Run all tests
bun run test
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `ENCRYPTION_SECRET_KEY` | 64-character hex key for AES-256-GCM |
| `OPENAI_API_KEY` | OpenAI API key for Whisper & GPT-4o |

## Packages

| Package | Path | Description |
|---|---|---|
| `@carevoice/api` | `apps/api` | Core API with Hono |
| `@carevoice/bff` | `apps/bff` | Backend-for-frontend |
| `@carevoice/web` | `apps/web` | Next.js frontend |
| `@carevoice/crypto` | `packages/crypto` | AES-256-GCM encryption utilities |
| `@carevoice/types` | `packages/types` | Shared TypeScript interfaces |

## License

MIT — see [LICENSE](LICENSE)