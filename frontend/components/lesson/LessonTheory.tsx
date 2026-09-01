"use client";

import { useEffect, type ReactNode } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface LessonTheoryProps {
  titleEs: string;
  titleEn: string | null;
  /** MDX ya compilado (Server Component) de cada versión. */
  contentEs: ReactNode;
  contentEn: ReactNode | null;
}

/**
 * Ambas versiones del MDX se compilan en el servidor (ver
 * app/lessons/[slug]/page.tsx) y llegan ya renderizadas acá — el toggle acá
 * es instantáneo, sin ida y vuelta al servidor. Si todavía no existe
 * traducción al inglés, se muestra español aunque el locale esté en "en".
 */
export function LessonTheory({ titleEs, titleEn, contentEs, contentEn }: LessonTheoryProps) {
  const { locale } = useLocale();
  const showEnglish = locale === "en" && contentEn !== null;

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
      <h1 className="mb-6 text-2xl font-bold">{showEnglish ? (titleEn ?? titleEs) : titleEs}</h1>
      {showEnglish ? contentEn : contentEs}
    </>
  );
}
