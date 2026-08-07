import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LocaleToggle } from "@/components/layout/LocaleToggle";

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-4">
      <Link href="/lessons" className="font-semibold tracking-tight">
        SeniorGaucho
      </Link>
      <div className="flex items-center gap-2">
        <LocaleToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
