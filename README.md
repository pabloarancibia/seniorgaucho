# SeniorGaucho

Plataforma de estudio interactiva para preparar entrevistas técnicas de backend (Python & TypeScript) — lecciones bilingües (ES/EN), ejercicios de código ejecutados 100% en el navegador, y un mentor con IA multi-proveedor que acompaña la práctica.

Es, a la vez, una app funcional y material de estudio: está construida siguiendo Arquitectura Hexagonal / DDD / Clean Code a propósito, como referencia de esos mismos conceptos que el temario enseña.

## Features

- **Lecciones bilingües** (ES/EN, toggle instantáneo sin recargar) escritas en MDX, con componentes de refuerzo pedagógico: `<Concept>` (jerga explicada), `<Hint>` (pistas progresivas), `<QuizCard>` (chequeos de comprensión).
- **Teoría y práctica en pantallas separadas**: cada tema tiene su propia pantalla de práctica con 2 columnas redimensionables — enunciado + chat de IA a la izquierda (apilados, 60/40), editor de código a toda la columna derecha.
- **Ejecución de código 100% client-side** — el backend nunca ejecuta código arbitrario. Python corre en el navegador vía Pyodide (WASM), TypeScript vía WebContainers.
- **Mentor con IA multi-proveedor** (Anthropic Claude / Google Gemini / proveedor Fake sin costo para desarrollo) — chat con pistas, explicaciones y preguntas libres, con streaming en tiempo real. El estudiante puede cambiar de proveedor manualmente (por ejemplo, si se queda sin cuota) sin perder el hilo de la conversación con el proveedor anterior.
- **Ejercicios colapsables con "ejercicio activo"**: desplegar un ejercicio le indica al mentor de IA cuál estás resolviendo, para que no tenga que adivinarlo.
- **Progreso persistido**: snippets de código, respuestas de quiz, y ejercicios completados se guardan por lección/tema.
- **Dashboard de progreso** con gráficos (Mermaid) del avance por módulo.

## Arquitectura

Monorepo pnpm-workspace con dos paquetes, `backend` y `frontend`, siguiendo Arquitectura Hexagonal / DDD en el backend:

```
domain          entidades + puertos (interfaces de repositorio, LlmProvider), sin dependencias externas
application     casos de uso — orquestan los puertos del dominio
infrastructure  adapters concretos: Prisma, Express, adaptadores de LLM (Anthropic/Google/Fake)
```

La composición se arma con inyección de dependencias manual (`infrastructure/config/container.ts`), sin framework de DI — las dependencias quedan explícitas.

El puerto `LlmProvider` (`domain/llm/`) es la pieza clave del soporte multi-LLM: cada proveedor (Anthropic, Google, Fake) es un adapter que lo implementa, y el resto del código (casos de uso, controllers, UI) no conoce ningún detalle de un SDK en particular. Agregar un proveedor nuevo es una clase más, sin tocar nada más.

## Stack

**Backend** — Node ≥20, Express 5, Prisma 7 (SQLite en desarrollo, migrable a PostgreSQL sin cambios estructurales), Zod, `@anthropic-ai/sdk`, `@google/genai`.

**Frontend** — Next.js 16 (App Router), React 19, Tailwind, MDX (`next-mdx-remote`), Monaco Editor, Pyodide, WebContainers, Mermaid.

## Getting started

Requiere Node ≥20 (`.nvmrc` fija `24`) y pnpm ≥9.

```bash
nvm use
pnpm install

cp backend/.env.example backend/.env
# completar backend/.env: al menos DATABASE_URL (ya viene con default de SQLite).
# GOOGLE_API_KEY / ANTHROPIC_API_KEY son opcionales — sin ellas, el chat de
# práctica usa el proveedor Fake (respuestas simuladas, sin costo).

pnpm --filter backend prisma:migrate
pnpm dev   # levanta backend (:4000) y frontend (:3000) en paralelo
```

Otros comandos útiles desde la raíz:

```bash
pnpm typecheck   # tsc --noEmit en ambos paquetes
pnpm lint        # eslint en ambos paquetes
pnpm build       # build de producción de ambos paquetes
```

## Estructura del repo

```
backend/
  prisma/                    schema + migraciones
  src/domain/                entidades, puertos, servicios de dominio
  src/application/           casos de uso
  src/infrastructure/        Express, Prisma, adaptadores LLM

frontend/
  app/                       rutas (App Router) — lecciones, práctica, temario
  components/                UI: lesson/, editor/, practiceTutor/, layout/
  lib/                       clientes de API, hooks, i18n, ejecución de código
```

## Licencia

GPL-3.0 — ver [LICENSE](LICENSE).
