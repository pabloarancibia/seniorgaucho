import { syllabus, type SyllabusTopic } from "@/lib/syllabus/data";

/** Todos los topics con lección cargada (slug no nulo), en el orden del temario. */
const loadedTopics: SyllabusTopic[] = syllabus.flatMap((module) =>
  module.topics.filter((topic): topic is SyllabusTopic & { slug: string } => topic.slug !== null)
);

/**
 * Lección anterior/siguiente en el orden del temario, saltando los temas
 * todavía no cargados (slug null) — solo lecciones navegables cuentan.
 */
export function getAdjacentLessons(currentSlug: string): { prev: SyllabusTopic | null; next: SyllabusTopic | null } {
  const index = loadedTopics.findIndex((topic) => topic.slug === currentSlug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? (loadedTopics[index - 1] ?? null) : null,
    next: index < loadedTopics.length - 1 ? (loadedTopics[index + 1] ?? null) : null,
  };
}
