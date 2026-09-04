export interface SyllabusTopic {
  code: string;
  title: string;
  titleEn: string;
  /** Slug de la lección en el backend, o null si el tema todavía no fue cargado. */
  slug: string | null;
}

export interface SyllabusModule {
  title: string;
  titleEn: string;
  topics: SyllabusTopic[];
}

/**
 * Path de estudio completo, mantenido a mano. No se puede derivar solo de
 * `GET /api/lessons`: el temario también lista temas planeados que todavía
 * no tienen lección cargada (slug null), así que cada vez que se agrega una
 * lección nueva hay que agregar/actualizar su entrada acá también.
 */
export const syllabus: SyllabusModule[] = [
  {
    title: "Módulo 0: Sintaxis, Estructuras y Patrones Creacionales/Estructurales (Warm-up)",
    titleEn: "Module 0: Syntax, Structures, and Creational/Structural Patterns (Warm-up)",
    topics: [
      {
        code: "0.0",
        title: "Repaso de Sintaxis Básica",
        titleEn: "Basic Syntax Review",
        slug: "m0-0-0-repaso-de-sintaxis-basica",
      },
      {
        code: "0.1",
        title: "Colecciones, Mutabilidad y Desempaquetado",
        titleEn: "Collections, Mutability, and Unpacking",
        slug: "m0-0-1-colecciones-mutabilidad-desempaquetado",
      },
      {
        code: "0.2",
        title: "Control de Flujo Idiomático y Funciones",
        titleEn: "Idiomatic Control Flow and Functions",
        slug: "m0-0-2-control-de-flujo-idiomatico-y-funciones",
      },
      {
        code: "0.3",
        title: "Value Objects, Tipado Estructural y Patrones Creacionales/Estructurales",
        titleEn: "Value Objects, Structural Typing, and Creational/Structural Patterns",
        slug: "m0-0-3-value-objects-tipado-estructural-patrones",
      },
      {
        code: "0.4",
        title: "Gimnasia de Tipos, Metaprogramación y Composición",
        titleEn: "Type Gymnastics, Metaprogramming, and Composition",
        slug: "m0-0-4-optional-generics-utility-types-uniones-discriminadas",
      },
      {
        code: "0.5",
        title: "Reto de Live Coding — Refactorización Extrema y Algoritmia Base",
        titleEn: "Live Coding Challenge — Extreme Refactoring and Core Algorithms",
        slug: "m0-0-5-refactorizacion-extrema-algoritmia-base",
      },
      {
        code: "0.6",
        title: "Grafos y Recorridos de Matrices (BFS/DFS)",
        titleEn: "Graphs and Matrix Traversal (BFS/DFS)",
        slug: "m0-0-6-grafos-bfs-dfs-topological-sort",
      },
      {
        code: "0.7",
        title: "Sliding Window y Two Pointers",
        titleEn: "Sliding Window and Two Pointers",
        slug: null,
      },
      {
        code: "0.8",
        title: "Hash Maps, Sets y Conteo de Frecuencias",
        titleEn: "Hash Maps, Sets, and Frequency Counting",
        slug: null,
      },
      {
        code: "0.9",
        title: "Heaps y Colas de Prioridad",
        titleEn: "Heaps and Priority Queues",
        slug: null,
      },
      {
        code: "0.10",
        title: "Árboles Binarios y Recursión",
        titleEn: "Binary Trees and Recursion",
        slug: null,
      },
    ],
  },
  {
    title: "Módulo 1: Runtime, Event Loop y Adaptación Externa",
    titleEn: "Module 1: Runtime, Event Loop, and External Adaptation",
    topics: [
      {
        code: "1.1",
        title: "Runtime, Event Loop y Adaptación Externa: Concurrencia y Backpressure",
        titleEn: "Runtime, Event Loop, and External Adaptation: Concurrency and Backpressure",
        slug: "m1-1-1-runtime-event-loop-concurrencia-backpressure",
      },
      {
        code: "1.2",
        title: "Reto de Live Coding — Refactor Asíncrono y Streams con Backpressure",
        titleEn: "Live Coding Challenge — Async Refactor and Streams with Backpressure",
        slug: null,
      },
    ],
  },
  {
    title: "Módulo 2: Consistencia de Datos, Locking y Transacciones",
    titleEn: "Module 2: Data Consistency, Locking, and Transactions",
    topics: [
      {
        code: "2.1",
        title: "Consistencia de Datos, Locking y Transacciones: Repository y Unit of Work",
        titleEn: "Data Consistency, Locking, and Transactions: Repository and Unit of Work",
        slug: null,
      },
      {
        code: "2.2",
        title: "Reto de Live Coding — Unit of Work Asíncrono y Bloqueo Pesimista",
        titleEn: "Live Coding Challenge — Async Unit of Work and Pessimistic Locking",
        slug: null,
      },
    ],
  },
  {
    title: "Módulo 3: Arquitectura Hexagonal y Validación en la Frontera",
    titleEn: "Module 3: Hexagonal Architecture and Validation at the Border",
    topics: [
      {
        code: "3.1",
        title: "Arquitectura Hexagonal y Validación en la Frontera: Strategy + DIP",
        titleEn: "Hexagonal Architecture and Validation at the Border: Strategy + DIP",
        slug: null,
      },
      {
        code: "3.2",
        title: "Reto de Live Coding — Caso de Uso con Puertos Invertidos y Validación Externa",
        titleEn: "Live Coding Challenge — Use Case with Inverted Ports and External Validation",
        slug: null,
      },
    ],
  },
  {
    title: "Módulo 4: Event-Driven, Idempotencia y Caching",
    titleEn: "Module 4: Event-Driven, Idempotency, and Caching",
    topics: [
      {
        code: "4.1",
        title: "Event-Driven, Idempotencia y Caching: Outbox, Cache-aside y Observer",
        titleEn: "Event-Driven, Idempotency, and Caching: Outbox, Cache-aside, and Observer",
        slug: null,
      },
      {
        code: "4.2",
        title: "Reto de Live Coding — Handler Idempotente y Cache-aside con Invalidación",
        titleEn: "Live Coding Challenge — Idempotent Handler and Cache-aside with Invalidation",
        slug: null,
      },
    ],
  },
  {
    title: "Módulo 5: Operaciones, Seguridad y Resiliencia en Producción",
    titleEn: "Module 5: Operations, Security, and Resilience in Production",
    topics: [
      {
        code: "5.1",
        title: "Operaciones, Seguridad y Resiliencia: Circuit Breaker, OWASP y Trazabilidad",
        titleEn: "Operations, Security, and Resilience: Circuit Breaker, OWASP, and Traceability",
        slug: null,
      },
      {
        code: "5.2",
        title: "Reto de Live Coding — Validador HMAC y Propagación de Correlation ID",
        titleEn: "Live Coding Challenge — HMAC Validator and Correlation ID Propagation",
        slug: null,
      },
    ],
  },
  {
    title: "Módulo 6: Estrategias Avanzadas de Testing de Elite",
    titleEn: "Module 6: Advanced Elite Testing Strategies",
    topics: [
      {
        code: "6.1",
        title: "Testing de Elite: Pirámide de Pruebas y Test Doubles",
        titleEn: "Elite Testing: Test Pyramid and Test Doubles",
        slug: null,
      },
      {
        code: "6.2",
        title: "Reto de Live Coding — Testcontainers y Test de Concurrencia Real",
        titleEn: "Live Coding Challenge — Testcontainers and Real Concurrency Test",
        slug: null,
      },
    ],
  },
];
