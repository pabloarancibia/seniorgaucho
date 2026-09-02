import { api } from "@/lib/api/client";
import { LessonsList } from "@/components/lesson/LessonsList";
import { extractAllExerciseIds } from "@/lib/lesson/extractTopicSlugs";

export default async function LessonsPage() {
  const lessons = await api.listLessons();
  const completions = await Promise.all(lessons.map((lesson) => api.listExerciseCompletions(lesson.id)));

  const completionByLessonId = Object.fromEntries(
    lessons.map((lesson, i) => {
      // El exerciseId sale de slugify(title) y el título SÍ está traducido,
      // así que el mismo ejercicio tiene un id distinto en cada locale — no
      // se puede mergear ES+EN acá (contaría cada ejercicio dos veces). Se
      // calculan los dos totales por separado; el componente cliente elige
      // según el locale actual.
      const idsEs = extractAllExerciseIds(lesson.mdxContent);
      const idsEn = lesson.mdxContentEn ? extractAllExerciseIds(lesson.mdxContentEn) : [];
      const completedIds = new Set(completions[i]!.filter((c) => c.completed).map((c) => c.exerciseId));
      const countFor = (ids: string[]) => ({
        completed: ids.filter((id) => completedIds.has(id)).length,
        total: ids.length,
      });
      return [lesson.id, { es: countFor(idsEs), en: countFor(idsEn) }];
    })
  );

  return <LessonsList lessons={lessons} completionByLessonId={completionByLessonId} />;
}
