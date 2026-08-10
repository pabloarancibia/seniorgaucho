"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Lesson, ProgressStatus } from "@/lib/api/types";

interface LessonsListProps {
  lessons: Lesson[];
  progressByLessonId: Record<string, ProgressStatus>;
}

export function LessonsList({ lessons, progressByLessonId }: LessonsListProps) {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">{t("lessons.title")}</h1>

      <Link
        href="/temario"
        className="mb-6 flex items-center justify-between rounded-lg border border-accent/50 bg-bg-subtle p-4 transition-colors hover:border-accent"
      >
        <span>
          <span className="block font-medium">📋 {t("syllabus.link.title")}</span>
          <span className="block text-xs text-fg-muted">{t("syllabus.link.subtitle")}</span>
        </span>
      </Link>

      {lessons.length === 0 ? (
        <p className="text-fg-muted">{t("lessons.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {lessons.map((lesson) => {
            const status = progressByLessonId[lesson.id] ?? "PENDING";
            return (
              <li key={lesson.id}>
                <Link
                  href={`/lessons/${lesson.slug}`}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:border-accent"
                >
                  <span className="font-medium">{lesson.title}</span>
                  <span className="text-xs text-fg-muted">{t(`lesson.status.${status.toLowerCase()}`)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
