const TEST_SUMMARY_REGEX = /(\d+)\/(\d+) tests passed/;

/**
 * Busca la línea de resumen que imprime todo `<ExerciseStarter>` con
 * check() (ver convención en memoria de contenido / feedback_exercise_starter_convention):
 * `${passed}/${total} tests passed`. Si no matchea, el ejercicio activo no
 * tiene esa convención de tests — el llamador no debe tocar su estado de
 * completitud.
 */
export function parseTestSummary(output: string): { passed: number; total: number } | null {
  const match = TEST_SUMMARY_REGEX.exec(output);
  if (!match) return null;
  const passed = Number(match[1]);
  const total = Number(match[2]);
  if (!Number.isFinite(passed) || !Number.isFinite(total) || total === 0) return null;
  return { passed, total };
}
