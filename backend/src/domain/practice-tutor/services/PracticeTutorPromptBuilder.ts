import type { ExtractedExercise } from "@domain/practice-tutor/services/ExerciseContentExtractor.js";

export type PracticeTutorLocale = "es" | "en";
export type PracticeTutorIntent = "hint" | "explain" | "free";

export interface PracticeTutorPromptContext {
  lessonTitle: string;
  topicTitle: string;
  exercises: ExtractedExercise[];
  currentCode: string;
  currentLanguage: "python" | "typescript";
  intent?: PracticeTutorIntent | undefined;
  locale: PracticeTutorLocale;
  /**
   * `ExtractedExercise.id` del ejercicio que el estudiante desplegó/tiene
   * abierto en la pantalla (ver ActiveExerciseContext en el frontend) — si
   * matchea uno de `exercises`, ESE va con detalle completo bajo "Ejercicio
   * activo" y el resto queda como lista liviana. Si no matchea ninguno
   * (todavía no clickeó nada), se mantiene el comportamiento viejo: todos
   * los ejercicios con detalle completo.
   */
  activeExerciseId?: string | null | undefined;
}

const RULES: Record<PracticeTutorLocale, string> = {
  es: `Sos un mentor técnico senior ayudando a alguien a practicar programación para entrevistas técnicas de backend. Hablás en español rioplatense, con voseo, tono cercano, directo y alentador. Sin emojis decorativos en el texto.

## Reglas

- Nunca reveles la solución completa de un ejercicio a la primera, salvo que el usuario la pida de forma explícita y clara ("dame la solución", "resolvémelo").
- Preferí las pistas ya escritas para el ejercicio (las vas a ver más abajo, con nivel 1, 2, 3...) antes de inventar una nueva — son la progresión que ya diseñó quien escribió la lección. Si ya diste todas, ahí sí podés razonar una pista propia.
- Mirá el "Código actual del estudiante" en cada mensaje — se te manda fresco, es lo que tiene escrito en el editor en este momento. Dale feedback específico sobre ESE código, no consejos genéricos desconectados de lo que escribió.
- Si el usuario pide "una pista": dale la siguiente pista que todavía no le diste, priorizando las ya escritas, formulada como pregunta guía cuando tenga sentido.
- Si el usuario pide "una explicación": explicá el concepto o el error detrás del ejercicio, sin necesariamente resolverle el código.
- Si el usuario hace una pregunta libre (sobre el ejercicio, un concepto relacionado, o algo de su código): respondé directamente y con precisión técnica — no fuerces el modo socrático si no viene al caso.
- Si hay un "## Ejercicio activo" marcado más abajo, el estudiante está trabajando en ESE ahora mismo — asumilo como el que están discutiendo salvo que el mensaje mencione claramente otro por nombre. Si no hay ninguno marcado, inferí de qué ejercicio habla por el contexto del mensaje y el código actual; si no está claro, preguntá.`,
  en: `You are a senior technical mentor helping someone practice coding for backend technical interviews. You speak in clear, direct, friendly, encouraging English. No decorative emojis in the text.

## Rules

- Never reveal the complete solution to an exercise on the first try, unless the user explicitly and clearly asks for it ("give me the solution", "just solve it for me").
- Prefer the hints already written for the exercise (you'll see them below, level 1, 2, 3...) before inventing a new one — they're the progression the lesson's author already designed. Once you've given all of them, you can reason out your own hint.
- Look at the "Student's current code" in each message — it's sent fresh, it's what's currently in their editor. Give specific feedback about THAT code, not generic advice disconnected from what they wrote.
- If the user asks for "a hint": give the next hint you haven't given yet, prioritizing the pre-written ones, phrased as a guiding question when it makes sense.
- If the user asks for "an explanation": explain the concept or the error behind the exercise, without necessarily solving the code for them.
- If the user asks a free-form question (about the exercise, a related concept, or something in their code): answer directly and with technical precision — don't force socratic mode when it doesn't fit.
- If there's an "## Active exercise" marked below, the student is currently working on THAT one — assume it's what they mean unless the message clearly names another one. If none is marked, infer which exercise they mean from the message and their current code; if unclear, ask.`,
};

const LABELS: Record<PracticeTutorLocale, Record<string, string>> = {
  es: {
    lesson: "Lección",
    topic: "Tema",
    exercises: "## Ejercicios de este tema",
    activeExercise: "## Ejercicio activo (el estudiante lo tiene desplegado ahora mismo)",
    otherExercises: "## Otros ejercicios de este tema (referencia, no es necesariamente de este que se habla)",
    exercise: "Ejercicio",
    language: "Lenguaje",
    hints: "Pistas progresivas ya escritas",
    level: "Nivel",
    currentCode: "## Código actual del estudiante",
    intentHint: "El estudiante tocó el botón \"Pedir pista\".",
    intentExplain: "El estudiante tocó el botón \"Explicame más\".",
  },
  en: {
    lesson: "Lesson",
    topic: "Topic",
    exercises: "## Exercises in this topic",
    activeExercise: "## Active exercise (the student has it expanded right now)",
    otherExercises: "## Other exercises in this topic (reference, not necessarily what's being discussed)",
    exercise: "Exercise",
    language: "Language",
    hints: "Progressive hints already written",
    level: "Level",
    currentCode: "## Student's current code",
    intentHint: "The student clicked the \"Ask for a hint\" button.",
    intentExplain: "The student clicked the \"Explain more\" button.",
  },
};

/**
 * Arma el system prompt del mentor de práctica. Función pura, sin I/O —
 * testeable con un snapshot para que cualquier cambio de pedagogía se vea
 * en el diff.
 *
 * La primera línea es un comentario HTML invisible con el locale — un LLM
 * real lo ignora semánticamente, pero le da a FakeLlmProvider (que parsea
 * este mismo texto por regex) una forma inequívoca de saber qué idioma usar.
 */
export function buildPracticeTutorSystemPrompt(context: PracticeTutorPromptContext): string {
  const l = LABELS[context.locale];
  const localeMarker = `<!-- seniorgaucho:locale=${context.locale} -->`;
  const rules = RULES[context.locale];

  const contextBlock = `${l.lesson}: ${context.lessonTitle}
${l.topic}: ${context.topicTitle}`;

  const activeExercise = context.exercises.find((exercise) => exercise.id === context.activeExerciseId);
  const exercisesBlock = activeExercise
    ? renderExercisesWithActive(context.exercises, activeExercise, l)
    : renderAllExercises(context.exercises, l);

  const codeBlock = `${l.currentCode}

\`\`\`${context.currentLanguage}
${context.currentCode}
\`\`\``;

  const intentBlock =
    context.intent === "hint" ? l.intentHint : context.intent === "explain" ? l.intentExplain : "";

  return [localeMarker, rules, contextBlock, exercisesBlock, codeBlock, intentBlock].filter(Boolean).join("\n\n");
}

function renderAllExercises(exercises: ExtractedExercise[], l: Record<string, string>): string {
  return [l.exercises, ...exercises.map((exercise) => renderExerciseDetail(exercise, l))].join("\n\n");
}

function renderExercisesWithActive(
  exercises: ExtractedExercise[],
  activeExercise: ExtractedExercise,
  l: Record<string, string>
): string {
  const others = exercises.filter((exercise) => exercise.id !== activeExercise.id);
  const activeBlock = [l.activeExercise, renderExerciseDetail(activeExercise, l)].join("\n\n");

  if (others.length === 0) return activeBlock;

  const othersList = others.map((exercise) => `- ${exercise.title} (${exercise.language})`).join("\n");
  return [activeBlock, l.otherExercises, othersList].join("\n\n");
}

function renderExerciseDetail(exercise: ExtractedExercise, l: Record<string, string>): string {
  const hintsBlock =
    exercise.hints.length > 0
      ? `\n  ${l.hints}:\n${exercise.hints.map((hint) => `    - ${l.level} ${hint.level}: ${hint.text}`).join("\n")}`
      : "";

  return `### ${l.exercise}: ${exercise.title}
${l.language}: ${exercise.language}

${exercise.promptText}${hintsBlock}`;
}
