# Changelog

All notable changes to CareVoice will be documented in this file.

## [Unreleased]

### Added
- Initial project structure with monorepo architecture
- Core API with Hono for DAR processing and AES-256-GCM encryption
- BFF layer for secure decryption before client delivery
- Next.js 14 frontend with Tailwind CSS
- Shared crypto and types packages
- Supabase database with RLS policies
- ESLint, Prettier, and TypeScript configuration
- Turborepo for build orchestration