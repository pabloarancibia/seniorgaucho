const PREFIX = "seniorgaucho:draft";

function draftKey(lessonId: string, topicSlug: string, exerciseId: string, language: string): string {
  return `${PREFIX}:${lessonId}:${topicSlug}:${exerciseId}:${language}`;
}

/**
 * Borrador local del editor, independiente del snippet persistido en el
 * backend. Es una red de seguridad contra refrescos/cierres accidentales
 * antes de que el autoguardado le pegue al backend — si falla (modo
 * privado, cuota excedida) no debe romper el editor, solo perder la red de
 * seguridad. Scopeado por tema + ejercicio activo (exerciseId) porque cada
 * ejercicio tiene su propio buffer — ver PracticeCodeEditorPanel.
 */
export function readDraft(lessonId: string, topicSlug: string, exerciseId: string, language: string): string | null {
  try {
    return window.localStorage.getItem(draftKey(lessonId, topicSlug, exerciseId, language));
  } catch {
    return null;
  }
}

export function writeDraft(
  lessonId: string,
  topicSlug: string,
  exerciseId: string,
  language: string,
  code: string
): void {
  try {
    window.localStorage.setItem(draftKey(lessonId, topicSlug, exerciseId, language), code);
  } catch {
    // localStorage no disponible o cuota excedida: no-op, no es crítico.
  }
}

export function clearDraft(lessonId: string, topicSlug: string, exerciseId: string, language: string): void {
  try {
    window.localStorage.removeItem(draftKey(lessonId, topicSlug, exerciseId, language));
  } catch {
    // no-op
  }
}
