# SeniorGaucho

An interactive study platform for backend technical interview prep (Python & TypeScript) — bilingual lessons (ES/EN), code exercises that run 100% in the browser, and a multi-provider AI mentor that helps out during practice.

It's both a working app and study material: it's deliberately built following Hexagonal Architecture / DDD / Clean Code, as a live reference for those same concepts the curriculum teaches.

## Features

- **Bilingual lessons** (ES/EN, instant toggle, no reload) written in MDX, with pedagogical reinforcement components: `<Concept>` (jargon explained), `<Hint>` (progressive hints), `<QuizCard>` (comprehension checks).
- **Theory and practice on separate screens**: each topic gets its own practice screen with 2 resizable columns — exercise statement + AI chat on the left (stacked, 60/40), code editor filling the entire right column.
- **100% client-side code execution** — the backend never runs arbitrary code. Python runs in the browser via Pyodide (WASM), TypeScript via WebContainers.
- **Multi-provider AI mentor** (Anthropic Claude / Google Gemini / a zero-cost Fake provider for development) — chat with hints, explanations, and free-form questions, with real-time streaming. The student can manually switch providers (e.g. if one runs out of quota) without losing the thread with the previous one.
- **Collapsible exercises with an "active exercise"**: expanding an exercise tells the AI mentor which one you're working on, instead of making it guess.
- **Persisted progress**: code snippets, quiz answers, and completed exercises are saved per lesson/topic.
- **Progress dashboard** with charts (Mermaid) of progress per module.

## Architecture

A pnpm-workspace monorepo with two packages, `backend` and `frontend`, following Hexagonal Architecture / DDD on the backend:

```
domain          entities + ports (repository interfaces, LlmProvider), zero external dependencies
application     use cases — orchestrate the domain's ports
infrastructure  concrete adapters: Prisma, Express, LLM adapters (Anthropic/Google/Fake)
```

Composition is wired via manual dependency injection (`infrastructure/config/container.ts`), no DI framework — dependencies stay explicit.

The `LlmProvider` port (`domain/llm/`) is the key piece behind multi-LLM support: each provider (Anthropic, Google, Fake) is an adapter implementing it, and the rest of the code (use cases, controllers, UI) knows nothing about any particular SDK. Adding a new provider is one more class, nothing else to touch.

## Stack

**Backend** — Node ≥20, Express 5, Prisma 7 (SQLite in development, migratable to PostgreSQL with no structural changes), Zod, `@anthropic-ai/sdk`, `@google/genai`.

**Frontend** — Next.js 16 (App Router), React 19, Tailwind, MDX (`next-mdx-remote`), Monaco Editor, Pyodide, WebContainers, Mermaid.

## Getting started

Requires Node ≥20 (`.nvmrc` pins `24`) and pnpm ≥9.

```bash
nvm use
pnpm install

cp backend/.env.example backend/.env
# fill in backend/.env: at minimum DATABASE_URL (already has a SQLite default).
# GOOGLE_API_KEY / ANTHROPIC_API_KEY are optional — without them, the practice
# chat uses the Fake provider (simulated replies, zero cost).

pnpm --filter backend prisma:migrate
pnpm dev   # runs backend (:4000) and frontend (:3000) in parallel
```

Other useful commands from the repo root:

```bash
pnpm typecheck   # tsc --noEmit in both packages
pnpm lint        # eslint in both packages
pnpm build       # production build of both packages
```

## Repo structure

```
backend/
  prisma/                    schema + migrations
  src/domain/                entities, ports, domain services
  src/application/           use cases
  src/infrastructure/        Express, Prisma, LLM adapters

frontend/
  app/                       routes (App Router) — lessons, practice, syllabus
  components/                UI: lesson/, editor/, practiceTutor/, layout/
  lib/                       API clients, hooks, i18n, code execution
```

## License

GPL-3.0 — see [LICENSE](LICENSE).
