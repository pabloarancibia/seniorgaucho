/**
 * Extrae, del MDX crudo de una lección, el contenido del tema (topicSlug)
 * que necesita el chat de práctica para armar contexto: enunciados de sus
 * <Exercise> y las pistas <Hint> ya autoradas. Vive en el backend (no en el
 * frontend) porque acá no hay árbol React ya compilado, solo el string
 * crudo `Lesson.mdxContent`/`mdxContentEn` — regex sobre texto, mismo
 * criterio pragmático que `frontend/lib/lesson/extractTopicSlugs.ts`
 * (relación documentada ahí también). No comparte código con el frontend:
 * son dos workspaces npm separados y la duplicación acá es chica.
 */

import { slugify } from "@domain/practice-tutor/services/slugify.js";

export interface ExtractedHint {
  level: number;
  text: string;
}

export interface ExtractedExercise {
  /** slugify(title) — mismo id que ExerciseCompletion.exerciseId, permite matchear el activeExerciseId que manda el frontend. */
  id: string;
  title: string;
  language: "python" | "typescript";
  /** Prosa del enunciado, con las <Hint> ya quitadas. */
  promptText: string;
  hints: ExtractedHint[];
}

export interface ExtractedTopicContent {
  topicTitle: string;
  exercises: ExtractedExercise[];
}

const SECTION_TAG_REGEX = /<Section\b([^>]*)>/g;
const NUMBER_ATTR_REGEX = /\bnumber="([^"]*)"/;
const EXERCISE_BLOCK_REGEX = /<Exercise\b([^>]*)>([\s\S]*?)<\/Exercise>/g;
const HINT_BLOCK_REGEX = /<Hint\b[^>]*>([\s\S]*?)<\/Hint>/g;
const STARTER_TAGS_REGEX = /<\/?ExerciseStarter>/g;

function extractAttr(tag: string, name: string): string | undefined {
  const doubleQuoted = new RegExp(`\\b${name}="((?:[^"\\\\]|\\\\.)*)"`).exec(tag);
  if (doubleQuoted?.[1] !== undefined) return doubleQuoted[1].replace(/\\"/g, '"');
  const singleQuoted = new RegExp(`\\b${name}='((?:[^'\\\\]|\\\\.)*)'`).exec(tag);
  if (singleQuoted?.[1] !== undefined) return singleQuoted[1].replace(/\\'/g, "'");
  return undefined;
}

function findSectionBlock(mdxSource: string, topicSlug: string): { title: string; body: string } | null {
  for (const match of mdxSource.matchAll(SECTION_TAG_REGEX)) {
    const attrs = match[1];
    if (attrs === undefined || match.index === undefined) continue;
    const number = NUMBER_ATTR_REGEX.exec(attrs)?.[1];
    if (number === undefined || `topic-${number}` !== topicSlug) continue;

    const title = extractAttr(attrs, "title") ?? "";
    const blockStart = match.index + match[0].length;
    const closeIdx = mdxSource.indexOf("</Section>", blockStart);
    const blockEnd = closeIdx === -1 ? mdxSource.length : closeIdx;
    return { title, body: mdxSource.slice(blockStart, blockEnd) };
  }
  return null;
}

function extractExercises(sectionBody: string): ExtractedExercise[] {
  const exercises: ExtractedExercise[] = [];

  for (const match of sectionBody.matchAll(EXERCISE_BLOCK_REGEX)) {
    const attrs = match[1];
    const inner = match[2];
    if (attrs === undefined || inner === undefined) continue;

    const title = extractAttr(attrs, "title") ?? "";
    const language = extractAttr(attrs, "language") === "typescript" ? "typescript" : "python";

    const hints: ExtractedHint[] = [];
    let level = 0;
    for (const hintMatch of inner.matchAll(HINT_BLOCK_REGEX)) {
      const hintText = hintMatch[1];
      if (hintText === undefined) continue;
      level += 1;
      hints.push({ level, text: hintText.trim() });
    }

    // El código de arranque/tests (<ExerciseStarter>) sí queda — es contexto
    // útil para el mentor (ve el esqueleto/HUECOs igual que el estudiante) —
    // solo se sacan las etiquetas del wrapper para que el prompt no tenga
    // markup MDX crudo alrededor del código.
    const promptText = inner.replace(HINT_BLOCK_REGEX, "").replace(STARTER_TAGS_REGEX, "").trim();
    exercises.push({ id: slugify(title), title, language, promptText, hints });
  }

  return exercises;
}

export function extractTopicContent(mdxSource: string, topicSlug: string): ExtractedTopicContent | null {
  const section = findSectionBlock(mdxSource, topicSlug);
  if (!section) return null;

  return { topicTitle: section.title, exercises: extractExercises(section.body) };
}
