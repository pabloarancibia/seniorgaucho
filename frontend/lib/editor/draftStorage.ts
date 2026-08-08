const PREFIX = "seniorgaucho:draft";

function draftKey(lessonId: string, language: string): string {
  return `${PREFIX}:${lessonId}:${language}`;
}

/**
 * Borrador local del editor, independiente del snippet persistido en el
 * backend. Es una red de seguridad contra refrescos/cierres accidentales
 * antes de hacer click en "Guardar snippet" — si falla (modo privado, cuota
 * excedida) no debe romper el editor, solo perder la red de seguridad.
 */
export function readDraft(lessonId: string, language: string): string | null {
  try {
    return window.localStorage.getItem(draftKey(lessonId, language));
  } catch {
    return null;
  }
}

export function writeDraft(lessonId: string, language: string, code: string): void {
  try {
    window.localStorage.setItem(draftKey(lessonId, language), code);
  } catch {
    // localStorage no disponible o cuota excedida: no-op, no es crítico.
  }
}

export function clearDraft(lessonId: string, language: string): void {
  try {
    window.localStorage.removeItem(draftKey(lessonId, language));
  } catch {
    // no-op
  }
}
