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
];
