import { api } from "@/lib/api/client";
import { LessonsList } from "@/components/lesson/LessonsList";

export default async function LessonsPage() {
  const lessons = await api.listLessons();
  const progresses = await Promise.all(lessons.map((lesson) => api.getProgress(lesson.id)));
  const progressByLessonId = Object.fromEntries(progresses.map((p) => [p.lessonId, p.status]));

  return <LessonsList lessons={lessons} progressByLessonId={progressByLessonId} />;
}
