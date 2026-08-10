"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { SyllabusModule } from "@/lib/syllabus/data";

export function SyllabusView({ modules }: { modules: SyllabusModule[] }) {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/lessons" className="mb-4 inline-block text-sm text-accent hover:underline">
        ← {t("nav.lessons")}
      </Link>
      <h1 className="mb-2 text-2xl font-bold">{t("syllabus.title")}</h1>
      <p className="mb-8 text-sm text-fg-muted">{t("syllabus.subtitle")}</p>

      <div className="flex flex-col gap-8">
        {modules.map((module) => (
          <section key={module.title}>
            <h2 className="mb-3 text-lg font-semibold">{module.title}</h2>
            <ul className="flex flex-col gap-2">
              {module.topics.map((topic) => (
                <li key={topic.code}>
                  {topic.slug ? (
                    <Link
                      href={`/lessons/${topic.slug}`}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-accent"
                    >
                      <span className="shrink-0 font-mono text-xs text-fg-muted">{topic.code}</span>
                      <span className="font-medium">{topic.title}</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-3 text-fg-muted">
                      <span className="shrink-0 font-mono text-xs">{topic.code}</span>
                      <span>{topic.title}</span>
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
