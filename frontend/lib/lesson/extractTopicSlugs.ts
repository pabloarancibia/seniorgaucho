import { slugify } from "@/lib/lesson/slugify";

const SECTION_TAG_REGEX = /<Section\b([^>]*)>/g;
const NUMBER_ATTR_REGEX = /\bnumber="([^"]*)"/;
const EXERCISE_TAG_REGEX = /<Exercise\b[^>]*>[\s\S]*?<\/Exercise>/g;
const EXERCISE_BLOCK_WITH_ATTRS_REGEX = /<Exercise\b([^>]*)>([\s\S]*?)<\/Exercise>/g;
const TITLE_ATTR_REGEX = /\btitle="((?:[^"\\]|\\.)*)"/;
const STARTER_BLOCK_REGEX = /<ExerciseStarter>\s*```[a-zA-Z]*\n([\s\S]*?)```\s*<\/ExerciseStarter>/;

interface SectionMatch {
  topicSlug: string;
  body: string;
}

/** Recorre cada <Section number="N">...</Section> del MDX crudo, en orden. */
function* iterateSections(mdxSource: string): Generator<SectionMatch> {
  for (const match of mdxSource.matchAll(SECTION_TAG_REGEX)) {
    const attrs = match[1];
    if (attrs === undefined || match.index === undefined) continue;
    const number = NUMBER_ATTR_REGEX.exec(attrs)?.[1];
    if (number === undefined) continue;

    const blockStart = match.index + match[0].length;
    const closeIdx = mdxSource.indexOf("</Section>", blockStart);
    const blockEnd = closeIdx === -1 ? mdxSource.length : closeIdx;

    yield { topicSlug: `topic-${number}`, body: mdxSource.slice(blockStart, blockEnd) };
  }
}

/**
 * Escanea el MDX crudo (string, sin compilar) buscando los `number="..."`
 * de cada <Section> — se usa solo para validar el `topicSlug` de la ruta de
 * práctica ANTES de compilar el MDX (notFound() temprano si no existe). Ver
 * Section.tsx: el topicSlug se deriva de `number`, no de `title` (título
 * traducido entre ES/EN, número no). Regex simple sobre el texto, no un
 * parser de MDX/AST — mismo criterio pragmático que slugify.ts.
 */
export function extractTopicSlugs(mdxSource: string): string[] {
  return [...iterateSections(mdxSource)].map((section) => section.topicSlug);
}

/**
 * Igual que extractTopicSlugs, pero solo los temas que contienen al menos
 * un <Exercise> — usados por Section.tsx (modo teoría) para decidir si
 * muestra el CTA "Practicá este tema". No se puede resolver inspeccionando
 * el árbol de children ya renderizado (ver comentario en Section.tsx: el
 * <Exercise> compilado tiene como `type` el wrapper inline de
 * mdxComponents.tsx, no el componente real), así que se resuelve acá,
 * sobre el string fuente, igual que extractTopicSlugs. Asume que los
 * <Section> no se anidan entre sí (cierto en todo el contenido actual).
 */
export function extractPracticableTopicSlugs(mdxSource: string): Set<string> {
  const slugs = new Set<string>();
  for (const section of iterateSections(mdxSource)) {
    if (section.body.includes("<Exercise")) slugs.add(section.topicSlug);
  }
  return slugs;
}

/**
 * Extrae, del MDX crudo, SOLO los bloques `<Exercise>...</Exercise>` de la
 * Section cuyo topicSlug matchea — descarta toda la prosa teórica alrededor
 * (headings, párrafos, código explicativo). Se recompila ese fragmento
 * (sigue siendo MDX válido) en vez de compilar el documento entero y
 * filtrar después: filtrar por identidad de componente sobre el árbol ya
 * renderizado NO funciona acá — mdxComponents.tsx envuelve Exercise en una
 * closure inline para inyectarle lessonId/mode, así que el `type` de cada
 * <Exercise> compilado es ese wrapper, no el componente real (mismo motivo
 * por el que Section.tsx no puede detectar Exercise por identidad — ver
 * gotcha_mdx_component_identity en memoria). Extraer antes de compilar
 * evita el problema de raíz: la pantalla de práctica nunca llega a incluir
 * teoría en el string que se le pasa a MDXRemote.
 */
export function extractExerciseBlocksForTopic(mdxSource: string, topicSlug: string): string | null {
  for (const section of iterateSections(mdxSource)) {
    if (section.topicSlug !== topicSlug) continue;
    const blocks = section.body.match(EXERCISE_TAG_REGEX);
    return blocks && blocks.length > 0 ? blocks.join("\n\n") : null;
  }
  return null;
}

/**
 * Extrae el código de arranque/tests de cada <Exercise> del tema, autorado
 * como un fence de código dentro de un <ExerciseStarter> hijo (ver
 * convención en memoria de contenido) — clave por `exerciseId`
 * (slugify del title, mismo id que ExerciseCompletion). Un <Exercise> sin
 * <ExerciseStarter> simplemente no aparece en el resultado — el editor cae
 * a su placeholder genérico para ese caso. Autorar <ExerciseStarter> es
 * código, no prosa: debe repetirse idéntico en mdxContent y mdxContentEn
 * (el título SÍ se traduce, así que el id derivado difiere entre locales —
 * ver PracticeScreen.tsx, que llama esta función sobre ambas fuentes y
 * mergea los resultados).
 */
/**
 * Todos los `exerciseId` (slugify del title) de una lección completa, sin
 * importar en qué `<Section>` estén — usado para el rollup de progreso
 * "X/Y ejercicios completados" a nivel lección (ver ExerciseCompletion,
 * que guarda `exerciseId` sin scope de topic). No usa iterateSections
 * porque acá no importa a qué tema pertenece cada uno, solo el total.
 */
export function extractAllExerciseIds(mdxSource: string): string[] {
  const ids: string[] = [];
  for (const match of mdxSource.matchAll(EXERCISE_BLOCK_WITH_ATTRS_REGEX)) {
    const attrs = match[1];
    if (attrs === undefined) continue;
    const title = TITLE_ATTR_REGEX.exec(attrs)?.[1];
    if (title === undefined) continue;
    ids.push(slugify(title));
  }
  return ids;
}

export function extractStarterCodeByExercise(mdxSource: string, topicSlug: string): Record<string, string> {
  const starterByExercise: Record<string, string> = {};

  for (const section of iterateSections(mdxSource)) {
    if (section.topicSlug !== topicSlug) continue;

    for (const match of section.body.matchAll(EXERCISE_BLOCK_WITH_ATTRS_REGEX)) {
      const attrs = match[1];
      const inner = match[2];
      if (attrs === undefined || inner === undefined) continue;

      const title = TITLE_ATTR_REGEX.exec(attrs)?.[1];
      if (title === undefined) continue;

      const code = STARTER_BLOCK_REGEX.exec(inner)?.[1];
      if (code === undefined) continue;

      starterByExercise[slugify(title)] = code.trimEnd();
    }
    break;
  }

  return starterByExercise;
}
