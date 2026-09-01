"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { MermaidChart } from "@/components/lesson/MermaidChart";
import { syllabus } from "@/lib/syllabus/data";
import type { Lesson, ProgressStatus } from "@/lib/api/types";

interface ProgressDashboardProps {
  lessons: Lesson[];
  progressByLessonId: Record<string, ProgressStatus>;
}

export function ProgressDashboard({ lessons, progressByLessonId }: ProgressDashboardProps) {
  const { t } = useLocale();

  if (lessons.length === 0) return null;

  const statusCounts: Record<ProgressStatus, number> = { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0 };
  for (const lesson of lessons) {
    const status = progressByLessonId[lesson.id] ?? "PENDING";
    statusCounts[status] += 1;
  }

  const continueLesson =
    lessons.find((lesson) => progressByLessonId[lesson.id] === "IN_PROGRESS") ??
    lessons.find((lesson) => (progressByLessonId[lesson.id] ?? "PENDING") === "PENDING");

  const loadedSlugs = new Set(lessons.map((lesson) => lesson.slug));
  const perModule = syllabus.map((module) => ({
    total: module.topics.length,
    loaded: module.topics.filter((topic) => topic.slug !== null && loadedSlugs.has(topic.slug)).length,
  }));
  const maxPerModule = Math.max(1, ...perModule.map((m) => m.total));

  const pieDefinition = [
    `pie showData title ${t("dashboard.pie.title")}`,
    `    "${t("lesson.status.completed")}" : ${statusCounts.COMPLETED}`,
    `    "${t("lesson.status.in_progress")}" : ${statusCounts.IN_PROGRESS}`,
    `    "${t("lesson.status.pending")}" : ${statusCounts.PENDING}`,
  ].join("\n");

  const barDefinition = [
    "xychart-beta",
    `    title "${t("dashboard.bar.title")}"`,
    `    x-axis [${perModule.map((_, i) => `M${i}`).join(", ")}]`,
    `    y-axis "${t("dashboard.bar.yaxis")}" 0 --> ${maxPerModule}`,
    `    bar [${perModule.map((m) => m.loaded).join(", ")}]`,
  ].join("\n");

  const completionPercent = Math.round((statusCounts.COMPLETED / lessons.length) * 100);

  return (
    <div className="mb-6 rounded-2xl border border-border p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">{t("dashboard.title")}</h2>
          <p className="text-sm text-fg-muted">
            {statusCounts.COMPLETED}/{lessons.length} {t("dashboard.completedLabel")}
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
