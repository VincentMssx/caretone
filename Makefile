.PHONY: dev build lint format typecheck test clean

dev:
	bun run dev

build:
	bun run build

lint:
	bun run lint

format:
	bun run format

typecheck:
	bun run typecheck

test:
	bun run test

clean:
	rm -rf dist .next .turbo node_modules