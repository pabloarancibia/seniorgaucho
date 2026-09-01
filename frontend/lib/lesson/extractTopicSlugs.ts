const SECTION_TAG_REGEX = /<Section\b([^>]*)>/g;
const NUMBER_ATTR_REGEX = /\bnumber="([^"]*)"/;

/**
 * Escanea el MDX crudo (string, sin compilar) buscando los `number="..."`
 * de cada <Section> — se usa solo para validar el `topicSlug` de la ruta de
 * práctica ANTES de compilar el MDX (notFound() temprano si no existe). Ver
 * Section.tsx: el topicSlug se deriva de `number`, no de `title` (título
 * traducido entre ES/EN, número no). Regex simple sobre el texto, no un
 * parser de MDX/AST — mismo criterio pragmático que slugify.ts.
 */
export function extractTopicSlugs(mdxSource: string): string[] {
  const slugs: string[] = [];
  for (const match of mdxSource.matchAll(SECTION_TAG_REGEX)) {
    const attrs = match[1];
    if (attrs === undefined) continue;
    const numberMatch = NUMBER_ATTR_REGEX.exec(attrs);
    const number = numberMatch?.[1];
    if (number === undefined) continue;
    slugs.push(`topic-${number}`);
  }
  return slugs;
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
  for (const match of mdxSource.matchAll(SECTION_TAG_REGEX)) {
    const attrs = match[1];
    if (attrs === undefined || match.index === undefined) continue;
    const numberMatch = NUMBER_ATTR_REGEX.exec(attrs);
    const number = numberMatch?.[1];
    if (number === undefined) continue;

    const blockStart = match.index + match[0].length;
    const closeIdx = mdxSource.indexOf("</Section>", blockStart);
    const blockEnd = closeIdx === -1 ? mdxSource.length : closeIdx;

    if (mdxSource.slice(blockStart, blockEnd).includes("<Exercise")) {
      slugs.add(`topic-${number}`);
    }
  }
  return slugs;
}
