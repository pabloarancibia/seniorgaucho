"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function Header() {
  const { t } = useLocale();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-bg px-4 sm:px-6">
      <div className="flex items-center gap-6">
        <Link href="/lessons" className="flex items-center gap-1.5 text-base font-extrabold tracking-tight">
          <span aria-hidden>🎓</span> SeniorGaucho
        </Link>
        <nav className="flex items-center gap-0.5 text-sm font-medium">
          <Link
            href="/lessons"
            className="rounded-full px-2.5 py-1 text-fg-muted transition-colors hover:bg-accent/10 hover:text-accent"
          >
            {t("nav.lessons")}
          </Link>
          <Link
            href="/temario"
            className="rounded-full px-2.5 py-1 text-fg-muted transition-colors hover:bg-accent/10 hover:text-accent"
          >
            {t("nav.syllabus")}
          </Link>
          <Link
            href="/zuriboats"
            className="rounded-full px-2.5 py-1 text-fg-muted transition-colors hover:bg-accent/10 hover:text-accent"
          >
            Zuriboats
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
