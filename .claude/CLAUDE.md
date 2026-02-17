# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm test                # TypeScript typecheck (tsc --noEmit) + Jest tests
npm run typecheck       # TypeScript type checking only
npm run test:watch      # Jest in watch mode
npm run upload-gist     # Upload reports to GitHub Gists (requires GH_TOKEN)
npm run lhci:mobile     # Run Lighthouse CI for mobile
npm run lhci:desktop    # Run Lighthouse CI for desktop
npm run lhci:all        # Run both mobile and desktop audits
```

Run a single test file:
```bash
npm test -- tests/application/create-report.test.ts
```

## Architecture

Hexagonal Architecture (Ports & Adapters) with three layers:

- **Domain** (`src/core/reports/domain/`) — Interfaces and types only. No dependencies on other layers. Contains `ManifestRepository`, `ReportRepository`, `ManifestSource`, `ManifestRun`, `Report`.
- **Application** (`src/core/reports/application/`) — Use cases with business logic. Depends only on Domain interfaces. `HandleManifest` processes manifests, `CreateReport` creates gist reports.
- **Infrastructure** (`src/core/reports/infrastructure/`) — External integrations (filesystem, GitHub API). Implements Domain interfaces. `ManifestReader` reads JSON files, `CreateReportGits` uses Octokit.

Entry point is `src/upload-gist.ts` which wires everything together. `DependencyContainer` (`src/core/reports/dependency-container.ts`) is a singleton that creates infrastructure instances.

## TypeScript & Module Setup

- ES2020 modules with **strict mode** enabled
- Imports require explicit `.ts` extensions (e.g., `import { Foo } from "./bar.ts"`)
- `tsc --noEmit` is configured — TypeScript is used for type checking only, not compilation
- Runtime execution uses `ts-node/esm` loader

## Testing Patterns

- Tests live in `tests/` mirroring `src/` structure (e.g., `tests/application/`, `tests/infrastructure/`)
- Uses **Fakes over Mocks** — create classes that `implement` domain interfaces with simplified logic
- Fakes should be **parametrizable** via constructor to support different test scenarios
- Use `expect(() => fn()).toThrow()` for synchronous errors, `await expect(fn()).rejects.toThrow()` for async
- `process.exit()` should not be used in application/domain layer — use `throw new Error()` instead

## Environment

- `GH_TOKEN` env var required for GitHub Gist operations
- Lighthouse reports are expected in `.lighthouse-reports/` with `mobile/` and `desktop/` subdirectories


## Validation code

- For validate the code you need run 2 different scripts first one pnpm test and pnpm typecheck