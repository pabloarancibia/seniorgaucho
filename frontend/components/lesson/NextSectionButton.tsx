"use client";

interface NextSectionButtonProps {
  currentTopicSlug: string;
  nextTopicSlug: string;
  label: string;
}

/**
 * Único pedacito de JS real dentro de <Section> (que por lo demás es
 * zero-JS, <details> nativo server-rendered) — cierra el tema actual, abre
 * el siguiente por id y hace scroll. Aislado en su propio "use client" para
 * no convertir Section.tsx entero en client component.
 */
export function NextSectionButton({ currentTopicSlug, nextTopicSlug, label }: NextSectionButtonProps) {
  const handleClick = () => {
    const current = document.getElementById(currentTopicSlug);
    const next = document.getElementById(nextTopicSlug);
    if (current instanceof HTMLDetailsElement) current.open = false;
    if (next instanceof HTMLDetailsElement) {
      next.open = true;
      next.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="not-prose inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-fg-muted transition-colors hover:border-accent hover:text-accent"
    >
      {label}
    </button>
  );
}
