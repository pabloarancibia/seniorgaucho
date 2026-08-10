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
    title: "Módulo 0: Sintaxis, Patrones Idiomáticos y Memoria Muscular (Warm-up)",
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
      { code: "0.3", title: "OOP, Clases y Metaprogramación", slug: null },
      { code: "0.4", title: "Gimnasia de Tipos (Type Gymnastics)", slug: null },
      { code: "0.5", title: "Reto de Live Coding — Refactorización Extrema", slug: null },
    ],
  },
  {
    title: "Módulo 1: El Motor y la Memoria (Execution & Memory)",
    topics: [
      { code: "1.1", title: "El Motor y la Memoria: Concurrencia, GIL y Event Loop", slug: null },
      { code: "1.2", title: "Reto de Live Coding — Streams y Backpressure", slug: null },
    ],
  },
  {
    title: "Módulo 2: Integridad y Concurrencia (Data & State)",
    topics: [
      { code: "2.1", title: "Integridad y Concurrencia: Locking y Aislamiento Transaccional", slug: null },
      { code: "2.2", title: "Reto de Live Coding — El Problema del Doble Gasto", slug: null },
    ],
  },
  {
    title: "Módulo 3: Fronteras, Tipos e Invariantes (Domain Architecture)",
    topics: [
      { code: "3.1", title: "Fronteras, Tipos e Invariantes: Arquitectura Hexagonal", slug: null },
      { code: "3.2", title: "Reto de Live Coding — Refactorización de Arquitectura", slug: null },
    ],
  },
  {
    title: "Módulo 4: Sistemas Distribuidos y Resiliencia (Distributed Systems)",
    topics: [
      { code: "4.1", title: "Sistemas Distribuidos: Colas, Caché y Consistencia Eventual", slug: null },
      { code: "4.2", title: "Reto de Live Coding — Procesador Idempotente", slug: null },
    ],
  },
  {
    title: "Módulo 5: Operaciones y Observabilidad (Production-Ready)",
    topics: [
      { code: "5.1", title: "Operaciones y Observabilidad: Trazabilidad y Graceful Shutdown", slug: null },
      { code: "5.2", title: "Reto de Live Coding — Rate Limiter", slug: null },
    ],
  },
];
