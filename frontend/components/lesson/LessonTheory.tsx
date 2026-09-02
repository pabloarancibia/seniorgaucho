"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { SyllabusTopic } from "@/lib/syllabus/data";

interface LessonTheoryProps {
  titleEs: string;
  titleEn: string | null;
  /** MDX ya compilado (Server Component) de cada versión. */
  contentEs: ReactNode;
  contentEn: ReactNode | null;
  /** Lección anterior/siguiente en el orden del temario (ver lib/syllabus/navigation.ts). */
  adjacentLessons: { prev: SyllabusTopic | null; next: SyllabusTopic | null };
}

/**
 * Ambas versiones del MDX se compilan en el servidor (ver
 * app/lessons/[slug]/page.tsx) y llegan ya renderizadas acá — el toggle acá
 * es instantáneo, sin ida y vuelta al servidor. Si todavía no existe
 * traducción al inglés, se muestra español aunque el locale esté en "en".
 */
export function LessonTheory({ titleEs, titleEn, contentEs, contentEn, adjacentLessons }: LessonTheoryProps) {
  const { locale, t } = useLocale();
  const showEnglish = locale === "en" && contentEn !== null;
  const { prev, next } = adjacentLessons;

  useEffect(() => {
    // El botón "← Volver a la teoría" de la pantalla de práctica linkea a
    // /lessons/[slug]#topicSlug — los anchors nativos no auto-expanden
    // <details>, así que lo forzamos acá al montar.
    const topicSlug = window.location.hash.slice(1);
    if (!topicSlug) return;
    const target = document.getElementById(topicSlug);
    if (target instanceof HTMLDetailsElement) {
      target.open = true;
      target.scrollIntoView({ block: "start" });
    }
  }, [showEnglish]);

  return (
    <>
      <Link href="/temario" className="mb-4 inline-block text-sm text-accent underline underline-offset-2">
        {t("theory.backToIndex")}
      </Link>
      <h1 className="mb-6 text-2xl font-bold">{showEnglish ? (titleEn ?? titleEs) : titleEs}</h1>
      {showEnglish ? contentEn : contentEs}
      {(prev || next) && (
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
          {prev ? (
            <Link
              href={`/lessons/${prev.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              {t("theory.prevLesson")}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/lessons/${next.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition-transform hover:scale-105"
            >
              {t("theory.nextLesson")}
            </Link>
          )}
        </div>
      )}
    </>
  );
}
