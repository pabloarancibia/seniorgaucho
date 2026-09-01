import type { LlmProvider, LlmProviderKey, LlmRequest, LlmResult } from "@domain/llm/ports/LlmProvider.js";
import type { LlmMessage } from "@domain/llm/value-objects/LlmMessage.js";
import type { LlmStreamEvent } from "@domain/llm/value-objects/LlmStreamEvent.js";

type FakeLocale = "es" | "en";
type FakeIntent = "hint" | "explain" | "free";

interface ParsedExercise {
  title: string;
  hints: { level: number; text: string }[];
}

interface FakeTemplates {
  hint: (level: number, text: string) => string;
  hintExhausted: () => string;
  explain: (title: string) => string;
  free: (userText: string) => string;
}

const TEMPLATES: Record<FakeLocale, FakeTemplates> = {
  es: {
    hint: (level, text) => `[fake] Pista nivel ${level}: ${text}`,
    hintExhausted: () =>
      "[fake] Ya te di todas las pistas que tengo escritas para este ejercicio — probá escribir algo en el editor y contame qué te tira, o pedime una explicación del concepto.",
    explain: (title) =>
      `[fake] Explicación del concepto detrás de "${title}": pensalo en términos del caso más simple posible primero, y después generalizá. [fake] respuesta simulada, sin costo.`,
    free: (userText) =>
      `[fake] Respuesta simulada a: "${userText}". Este es el proveedor Fake — no gasta tokens, sirve para probar el chat end-to-end antes de conectar un proveedor real.`,
  },
  en: {
    hint: (level, text) => `[fake] Hint level ${level}: ${text}`,
    hintExhausted: () =>
      "[fake] I've given you every hint I have written for this exercise — try writing something in the editor and tell me what happens, or ask me to explain the concept.",
    explain: (title) =>
      `[fake] Explanation of the concept behind "${title}": think about the simplest possible case first, then generalize. [fake] simulated response, zero cost.`,
    free: (userText) =>
      `[fake] Simulated reply to: "${userText}". This is the Fake provider — costs no tokens, exercises the chat end-to-end before wiring up a real provider.`,
  },
};

function detectLocale(systemPrompt: string): FakeLocale {
  return /seniorgaucho:locale=en/.exec(systemPrompt) ? "en" : "es";
}

function detectIntent(systemPrompt: string, locale: FakeLocale): FakeIntent {
  const hintMarker = locale === "en" ? 'clicked the "Ask for a hint"' : 'tocó el botón "Pedir pista"';
  const explainMarker = locale === "en" ? 'clicked the "Explain more"' : 'tocó el botón "Explicame más"';
  if (systemPrompt.includes(hintMarker)) return "hint";
  if (systemPrompt.includes(explainMarker)) return "explain";
  return "free";
}

/**
 * Parsea solo el PRIMER <Exercise> del tema (título + pistas), tal como lo
 * emite PracticeTutorPromptBuilder — suficiente para simular la escalada de
 * pistas sin necesitar desambiguar entre varios ejercicios del mismo tema.
 */
function parseFirstExercise(systemPrompt: string, locale: FakeLocale): ParsedExercise | null {
  const headerRegex = locale === "en" ? /### Exercise: ([^\n]+)/ : /### Ejercicio: ([^\n]+)/;
  const headerMatch = headerRegex.exec(systemPrompt);
  if (!headerMatch || headerMatch.index === undefined) return null;

  const title = (headerMatch[1] ?? "").trim();
  const blockStart = headerMatch.index + headerMatch[0].length;
  const rest = systemPrompt.slice(blockStart);
  // Corta en el próximo heading de nivel 2 O 3: con activeExerciseId
  // presente, PracticeTutorPromptBuilder cierra el detalle del ejercicio
  // activo con un "## Otros ejercicios..." (nivel 2), no otro "###
  // Ejercicio" (nivel 3) como cuando lista todos — cortar solo en "### "
  // dejaba that heading y todo lo que sigue (código actual, marcador de
  // intent) adentro del texto de la última pista.
  const nextHeaderIdx = rest.search(/\n#{2,3} /);
  const block = nextHeaderIdx === -1 ? rest : rest.slice(0, nextHeaderIdx);

  // El texto de una pista puede ser multilínea (p. ej. un bloque de código
  // fenced) — cada bullet marca solo dónde EMPIEZA su texto, así que el
  // contenido de cada pista es todo lo que sigue hasta el próximo bullet
  // "- Nivel/Level N:" o el final del bloque, no solo la primera línea.
  const hintMarkerRegex = /-\s*(?:Nivel|Level)\s*(\d+):/g;
  const markers = [...block.matchAll(hintMarkerRegex)];
  const hints = markers.map((match, i) => {
    const contentStart = (match.index ?? 0) + match[0].length;
    const contentEnd = markers[i + 1]?.index ?? block.length;
    return { level: Number(match[1]), text: block.slice(contentStart, contentEnd).trim() };
  });

  return { title, hints };
}

function countUserMessages(messages: LlmMessage[]): number {
  return messages.filter((m) => m.role === "user").length;
}

/**
 * Respuestas guionadas — sin red, sin costo — para desarrollar y verificar
 * todo el pipeline (streaming, persistencia, resume de sesión) sin depender
 * de una API key real. Parsea el system prompt que arma
 * PracticeTutorPromptBuilder (mismo formato, ver
 * domain/practice-tutor/services) en vez de tocar la base de datos
 * directamente, para respetar el mismo contrato que un adapter real
 * tendría. Bilingüe: lee el marcador "<!-- seniorgaucho:locale=es|en -->"
 * que PracticeTutorPromptBuilder pone como primera línea del prompt.
 */
export class FakeLlmProvider implements LlmProvider {
  readonly key: LlmProviderKey = "fake";
  readonly model = "fake-mentor-v1";

  async generate(_request: LlmRequest): Promise<LlmResult> {
    return { text: "[fake] generate() no se usa en el chat de práctica de SeniorGaucho (solo stream())." };
  }

  async *stream(request: LlmRequest, _signal?: AbortSignal): AsyncIterable<LlmStreamEvent> {
    const locale = detectLocale(request.system);
    const intent = detectIntent(request.system, locale);
    const exercise = parseFirstExercise(request.system, locale);
    const templates = TEMPLATES[locale];

    let text: string;

    if (intent === "explain") {
      text = templates.explain(exercise?.title ?? "");
    } else if (intent === "hint") {
      const attempt = countUserMessages(request.messages);
      const hint = exercise?.hints[Math.min(attempt - 1, exercise.hints.length - 1)];
      text = hint ? templates.hint(hint.level, hint.text) : templates.hintExhausted();
    } else {
      const lastUserMessage = [...request.messages].reverse().find((m) => m.role === "user");
      text = templates.free(lastUserMessage?.text ?? "");
    }

    // Simula streaming token por token para ejercitar el mismo camino de
    // eventos que un proveedor real (SSE del lado del controller).
    for (const word of text.split(" ")) {
      yield { type: "text_delta", text: word + " " };
    }

    const message: LlmMessage = { role: "assistant", text };
    yield { type: "done", message, stopReason: "end_turn" };
  }
}
