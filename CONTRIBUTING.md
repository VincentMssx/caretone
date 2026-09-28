# Contributing to CareVoice

Thank you for your interest in contributing to CareVoice. This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `bun install`
4. Create a new branch: `git checkout -b feature/your-feature-name`
5. Make your changes
6. Run linting and formatting: `bun run lint && bun run format`
7. Run type-checking: `bun run typecheck`
8. Run tests: `bun run test`
9. Commit your changes with a conventional commit message
10. Push to your fork and open a Pull Request

## Commit Convention

Use conventional commits:

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation changes
- `refactor:` — code refactoring
- `test:` — adding or updating tests
- `chore:` — maintenance tasks
- `ci:` — CI/CD changes

## Code Style

- TypeScript strict mode
- 2-space indentation
- Single quotes
- Trailing commas
- No semicolons in JSX
- Explicit return types on exported functions
- Handle errors with try/catch in async handlers
- Return proper HTTP status codes from all route handlers

## Pull Request Process

1. Ensure all checks pass (lint, typecheck, test)
2. Update documentation if needed
3. Add or update tests for new functionality
4. Request review from maintainers

## Reporting Issues

When reporting bugs, please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node/Bun version, etc.)