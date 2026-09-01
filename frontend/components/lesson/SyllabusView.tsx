"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { SyllabusModule } from "@/lib/syllabus/data";

export function SyllabusView({ modules }: { modules: SyllabusModule[] }) {
  const { t, locale } = useLocale();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link
        href="/lessons"
        className="mb-4 inline-block text-sm font-medium text-accent transition-colors hover:text-accent-secondary"
      >
        ← {t("nav.lessons")}
      </Link>
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight">{t("syllabus.title")}</h1>
      <p className="mb-8 text-sm text-fg-muted">{t("syllabus.subtitle")}</p>

      <div className="flex flex-col gap-8">
        {modules.map((module) => (
          <section key={module.title}>
            <h2 className="mb-3 text-lg font-bold">{locale === "en" ? module.titleEn : module.title}</h2>
            <ul className="flex flex-col gap-2">
              {module.topics.map((topic) => (
                <li key={topic.code}>
                  {topic.slug ? (
                    <Link
                      href={`/lessons/${topic.slug}`}
                      className="flex items-center gap-3 rounded-2xl border border-border p-3.5 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
                    >
                      <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 font-mono text-xs text-accent">
                        {topic.code}
                      </span>
                      <span className="font-medium">{locale === "en" ? topic.titleEn : topic.title}</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-3.5 text-fg-muted">
                      <span className="shrink-0 rounded-full bg-border/50 px-2 py-0.5 font-mono text-xs">
                        {topic.code}
                      </span>
                      <span>{locale === "en" ? topic.titleEn : topic.title}</span>
                      <span className="ml-auto shrink-0 text-xs">{t("syllabus.upcoming")}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
