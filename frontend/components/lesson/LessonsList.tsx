"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { ProgressDashboard } from "@/components/lesson/ProgressDashboard";
import type { Lesson, ProgressStatus } from "@/lib/api/types";

interface LessonsListProps {
  lessons: Lesson[];
  progressByLessonId: Record<string, ProgressStatus>;
}

export function LessonsList({ lessons, progressByLessonId }: LessonsListProps) {
  const { t, locale } = useLocale();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight">{t("lessons.title")}</h1>

      <ProgressDashboard lessons={lessons} progressByLessonId={progressByLessonId} />

      <Link
        href="/temario"
        className="mb-6 flex items-center justify-between rounded-2xl border border-accent/40 bg-accent/5 p-5 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
      >
        <span>
          <span className="block font-semibold">📋 {t("syllabus.link.title")}</span>
          <span className="block text-xs text-fg-muted">{t("syllabus.link.subtitle")}</span>
        </span>
      </Link>

      {lessons.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-bg-subtle p-6 text-center text-fg-muted">
          {t("lessons.empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {lessons.map((lesson) => {
            const status = progressByLessonId[lesson.id] ?? "PENDING";
            return (
              <li key={lesson.id}>
                <Link
                  href={`/lessons/${lesson.slug}`}
                  className="flex items-center justify-between rounded-2xl border border-border p-4 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
                >
                  <span className="font-medium">
                    {locale === "en" ? (lesson.titleEn ?? lesson.title) : lesson.title}
                  </span>
                  <span
                    className={[
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                      status === "COMPLETED" && "bg-accent-secondary/15 text-accent-secondary",
                      status === "IN_PROGRESS" && "bg-accent-warm/15 text-accent-warm",
                      status === "PENDING" && "bg-border/50 text-fg-muted",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {t(`lesson.status.${status.toLowerCase()}`)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
