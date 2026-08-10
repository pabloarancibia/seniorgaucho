export interface SyllabusTopic {
  code: string;
  title: string;
  /** Slug de la lección en el backend, o null si el tema todavía no fue cargado. */
  slug: string | null;
}

export interface SyllabusModule {
  title: string;
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
    topics: [
      { code: "0.0", title: "Repaso de Sintaxis Básica", slug: "m0-0-0-repaso-de-sintaxis-basica" },
      {
        code: "0.1",
        title: "Colecciones, Mutabilidad y Desempaquetado",
        slug: "m0-0-1-colecciones-mutabilidad-desempaquetado",
      },
      {
        code: "0.2",
        title: "Control de Flujo Idiomático y Funciones",
        slug: "m0-0-2-control-de-flujo-idiomatico-y-funciones",
      },
      {
        code: "0.3",
        title: "Value Objects, Tipado Estructural y Patrones Creacionales/Estructurales",
        slug: null,
      },
      { code: "0.4", title: "Gimnasia de Tipos (Type Gymnastics)", slug: null },
      { code: "0.5", title: "Reto de Live Coding — Refactorización Extrema", slug: null },
    ],
  },
  {
    title: "Módulo 1: Runtime, Event Loop y Adaptación Externa",
    topics: [
      { code: "1.1", title: "Runtime, Event Loop y Adaptación Externa: Concurrencia y Backpressure", slug: null },
      { code: "1.2", title: "Reto de Live Coding — Refactor Asíncrono y Streams con Backpressure", slug: null },
    ],
  },
  {
    title: "Módulo 2: Consistencia de Datos, Locking y Transacciones",
    topics: [
      { code: "2.1", title: "Consistencia de Datos, Locking y Transacciones: Repository y Unit of Work", slug: null },
      { code: "2.2", title: "Reto de Live Coding — Unit of Work Asíncrono y Bloqueo Pesimista", slug: null },
    ],
  },
  {
    title: "Módulo 3: Arquitectura Hexagonal y Validación en la Frontera",
    topics: [
      { code: "3.1", title: "Arquitectura Hexagonal y Validación en la Frontera: Strategy + DIP", slug: null },
      { code: "3.2", title: "Reto de Live Coding — Caso de Uso con Puertos Invertidos y Validación Externa", slug: null },
    ],
  },
  {
    title: "Módulo 4: Event-Driven, Idempotencia y Caching",
    topics: [
      { code: "4.1", title: "Event-Driven, Idempotencia y Caching: Outbox, Cache-aside y Observer", slug: null },
      { code: "4.2", title: "Reto de Live Coding — Handler Idempotente y Cache-aside con Invalidación", slug: null },
    ],
  },
  {
    title: "Módulo 5: Operaciones, Seguridad y Resiliencia en Producción",
    topics: [
      {
        code: "5.1",
        title: "Operaciones, Seguridad y Resiliencia: Circuit Breaker, OWASP y Trazabilidad",
        slug: null,
      },
      { code: "5.2", title: "Reto de Live Coding — Validador HMAC y Propagación de Correlation ID", slug: null },
    ],
  },
  {
    title: "Módulo 6: Estrategias Avanzadas de Testing de Elite",
    topics: [
      { code: "6.1", title: "Testing de Elite: Pirámide de Pruebas y Test Doubles", slug: null },
      { code: "6.2", title: "Reto de Live Coding — Testcontainers y Test de Concurrencia Real", slug: null },
    ],
  },
];
