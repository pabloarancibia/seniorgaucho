/**
 * Port exacto de `frontend/lib/lesson/slugify.ts` — mismo algoritmo, mismo
 * espacio de ids que `ExerciseCompletion.exerciseId`. Necesario acá porque
 * `ExerciseContentExtractor` computa el `id` de cada ejercicio extraído
 * para poder matchearlo contra el `activeExerciseId` que manda el
 * frontend (ver SendPracticeChatMessageUseCase) — el mismo id que ya usa
 * el checkbox de "completado".
 */
export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita diacríticos (tildes) tras NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
