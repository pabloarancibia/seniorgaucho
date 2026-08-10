"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LocaleToggle } from "@/components/layout/LocaleToggle";

export function Header() {
  const { t } = useLocale();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-4">
      <div className="flex items-center gap-6">
        <Link href="/lessons" className="font-semibold tracking-tight">
          SeniorGaucho
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/lessons" className="text-fg-muted transition-colors hover:text-fg">
            {t("nav.lessons")}
          </Link>
          <Link href="/zuriboats" className="text-fg-muted transition-colors hover:text-fg">
            Zuriboats
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <LocaleToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
