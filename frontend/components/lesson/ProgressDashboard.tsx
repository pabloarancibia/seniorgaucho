"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { MermaidChart } from "@/components/lesson/MermaidChart";
import { syllabus } from "@/lib/syllabus/data";
import type { Lesson } from "@/lib/api/types";

interface ExerciseCount {
  completed: number;
  total: number;
}

interface ProgressDashboardProps {
  lessons: Lesson[];
  /** Ejercicios completados/total por lección, por locale (el exerciseId difiere por título traducido) — ver extractAllExerciseIds. */
  completionByLessonId: Record<string, { es: ExerciseCount; en: ExerciseCount }>;
}

export function ProgressDashboard({ lessons, completionByLessonId }: ProgressDashboardProps) {
  const { t, locale } = useLocale();

  if (lessons.length === 0) return null;

  const countFor = (lessonId: string): ExerciseCount => {
    const counts = completionByLessonId[lessonId];
    if (!counts) return { completed: 0, total: 0 };
    return locale === "en" && counts.en.total > 0 ? counts.en : counts.es;
  };

  const totals = lessons.reduce(
    (acc, lesson) => {
      const count = countFor(lesson.id);
      return { completed: acc.completed + count.completed, total: acc.total + count.total };
    },
    { completed: 0, total: 0 }
  );

  const doneLessons = lessons.filter((lesson) => {
    const count = countFor(lesson.id);
    return count.total > 0 && count.completed === count.total;
  }).length;

  // "Seguir donde quedé": la primera lección con progreso a medias, o si no
  // hay ninguna, la primera sin empezar.
  const continueLesson =
    lessons.find((lesson) => {
      const count = countFor(lesson.id);
      return count.completed > 0 && count.completed < count.total;
    }) ?? lessons.find((lesson) => countFor(lesson.id).completed === 0);

  const loadedSlugs = new Set(lessons.map((lesson) => lesson.slug));
  const perModule = syllabus.map((module) => ({
    total: module.topics.length,
    loaded: module.topics.filter((topic) => topic.slug !== null && loadedSlugs.has(topic.slug)).length,
  }));
  const maxPerModule = Math.max(1, ...perModule.map((m) => m.total));

  const pending = Math.max(0, totals.total - totals.completed);
  const pieDefinition = [
    `pie showData title ${t("dashboard.pie.title")}`,
    `    "${t("lesson.status.completed")}" : ${totals.completed}`,
    `    "${t("lesson.status.pending")}" : ${pending}`,
  ].join("\n");

  const barDefinition = [
    "xychart-beta",
    `    title "${t("dashboard.bar.title")}"`,
    `    x-axis [${perModule.map((_, i) => `M${i}`).join(", ")}]`,
    `    y-axis "${t("dashboard.bar.yaxis")}" 0 --> ${maxPerModule}`,
    `    bar [${perModule.map((m) => m.loaded).join(", ")}]`,
  ].join("\n");

  const completionPercent = totals.total > 0 ? Math.round((totals.completed / totals.total) * 100) : 0;

  return (
    <div className="mb-6 rounded-2xl border border-border p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">{t("dashboard.title")}</h2>
          <p className="text-sm text-fg-muted">
            {doneLessons}/{lessons.length} {t("dashboard.completedLabel")} · {totals.completed}/{totals.total}{" "}
            {t("editor.exercisesCompleted")}
          </p>
        </div>
        {continueLesson ? (
          <Link
            href={`/lessons/${continueLesson.slug}`}
            className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition-transform hover:scale-105"
          >
            {t("dashboard.continue")}
          </Link>
        ) : (
          <span className="shrink-0 text-sm font-medium text-accent-secondary">{t("dashboard.allDone")}</span>
        )}
      </div>

      <div
        role="progressbar"
        aria-valuenow={completionPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mb-5 h-3 w-full overflow-hidden rounded-full bg-bg-subtle"
      >
        <div
          style={{ width: `${completionPercent}%` }}
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-secondary transition-[width] duration-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MermaidChart definition={pieDefinition} />
        <MermaidChart definition={barDefinition} />
      </div>
    </div>
  );
}
