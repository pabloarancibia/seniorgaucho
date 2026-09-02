import Link from "next/link";
import type { ReactNode } from "react";
import { slugify } from "@/lib/lesson/slugify";
import { NextSectionButton } from "@/components/lesson/NextSectionButton";

interface SectionProps {
  /**
   * Número del punto dentro de la lección (ej. "1", "2"...), como STRING —
   * next-mdx-remote bloquea expresiones JS en atributos MDX (`number={1}`
   * se descartaría en runtime, ver mismo gotcha que QuizCard/blockJS), así
   * que el autor del MDX escribe `number="1"`, nunca `number={1}`.
   */
  number?: string;
  title: string;
  children: ReactNode;
  /** Abierta por default — normalmente solo el primer punto de la lección. */
  defaultOpen?: boolean;
  /** Inyectados por mdxComponents (modo teoría), no los escribe el autor del MDX. */
  lessonSlug?: string;
  locale?: "es" | "en";
  /**
   * Topics (topicSlug) que tienen al menos un <Exercise> — decide el CTA de
   * práctica. Se calcula con un regex sobre el MDX crudo
   * (extractPracticableTopicSlugs en extractTopicSlugs.ts) en vez de
   * inspeccionar el árbol de `children` ya renderizado: mdxComponents.tsx
   * mapea Exercise a un wrapper inline (`(props) => <Exercise {...props}
   * lessonId={...} mode={...} />`) para poder inyectarle esas props, así
   * que el `type` de cada elemento <Exercise> ya compilado es ESE wrapper,
   * no el componente Exercise importado acá — un `child.type === Exercise`
   * nunca matchea. El regex sobre el string fuente es la única señal
   * confiable acá.
   */
  practicableTopicSlugs?: Set<string>;
  /** Orden real de los topicSlug de la lección — habilita el botón "Siguiente tema" al pie. */
  orderedTopicSlugs?: string[];
}

const CTA_LABEL = { es: "Practicá este tema →", en: "Practice this topic →" };
const NEXT_LABEL = { es: "Siguiente tema ↓", en: "Next topic ↓" };

/**
 * Acordeón para cada punto numerado de la teoría de una lección (## 1.,
 * ## 2., etc.) — reemplaza el heading plano de siempre. Mismo mecanismo que
 * <Concept>/<Hint>: <details> nativo, sin JS ni estado de React, funciona
 * server-rendered. El contenido interno (###, código, <Concept>, <Exercise>)
 * se sigue renderizando normal vía los componentes de mdxComponents.tsx —
 * Section solo agrega el contenedor colapsable alrededor.
 *
 * Solo aparece en modo teoría — mdxComponents.tsx lo mapea a `null` en modo
 * práctica, donde ni siquiera hace falta: el fragmento que se compila ahí
 * ya viene recortado a los <Exercise> de un solo tema (ver
 * extractExerciseBlocksForTopic), nunca incluye un <Section> completo con
 * su prosa teórica.
 *
 * También es la unidad de ruteo de la pantalla de práctica: "topic-{number}"
 * es el "topicSlug" de /lessons/[slug]/practice/[topicSlug]. Se deriva de
 * `number`, NO de `title` — el título está traducido entre mdxContent (ES)
 * y mdxContentEn (EN), así que slugificarlo daría un slug distinto por
 * idioma para el mismo tema. `number` es estable entre idiomas. Fallback a
 * slugify(title) solo si un <Section> queda sin `number` (no debería pasar
 * en contenido nuevo). Si contiene algún <Exercise> se agrega un CTA al
 * final para saltar a la pantalla de práctica de ese tema.
 */
export function Section({
  number,
  title,
  children,
  defaultOpen = false,
  lessonSlug,
  locale = "es",
  practicableTopicSlugs,
  orderedTopicSlugs,
}: SectionProps) {
  const topicSlug = number !== undefined ? `topic-${number}` : slugify(title);
  const showPracticeCta = lessonSlug !== undefined && (practicableTopicSlugs?.has(topicSlug) ?? false);
  const ownIndex = orderedTopicSlugs?.indexOf(topicSlug) ?? -1;
  const nextTopicSlug = ownIndex !== -1 ? orderedTopicSlugs?.[ownIndex + 1] : undefined;

  return (
    <details
      id={topicSlug}
      open={defaultOpen}
      className="not-prose group my-6 overflow-hidden rounded-2xl border border-border transition-shadow open:shadow-md"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 bg-bg-subtle px-5 py-4 transition-colors hover:bg-border/30 [&::-webkit-details-marker]:hidden">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm text-accent transition-transform group-open:rotate-90"
          aria-hidden
        >
          ▸
        </span>
        {number !== undefined && <span className="shrink-0 text-lg font-bold text-accent">{number}.</span>}
        <span className="text-lg font-semibold">{title}</span>
      </summary>
      <div className="accordion-content space-y-4 px-5 py-5">
        {children}
        {(showPracticeCta || nextTopicSlug) && (
          <div className="flex flex-wrap items-center gap-3">
            {showPracticeCta && (
              <Link
                href={`/lessons/${lessonSlug}/practice/${topicSlug}`}
                className="not-prose inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition-transform hover:scale-105"
              >
                {CTA_LABEL[locale]}
              </Link>
            )}
            {nextTopicSlug && (
              <NextSectionButton currentTopicSlug={topicSlug} nextTopicSlug={nextTopicSlug} label={NEXT_LABEL[locale]} />
            )}
          </div>
        )}
      </div>
    </details>
  );
}
