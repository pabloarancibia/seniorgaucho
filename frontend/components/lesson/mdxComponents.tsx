import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import { QuizCard } from "@/components/lesson/QuizCard";
import { QuizOption } from "@/components/lesson/QuizOption";
import { Exercise } from "@/components/lesson/Exercise";
import { Concept } from "@/components/lesson/Concept";
import { Hint } from "@/components/lesson/Hint";
import { Section } from "@/components/lesson/Section";

interface QuizCardMdxProps {
  questionId: string;
  question: string;
  correctOption: string;
  explanation?: string;
  children: ReactNode;
}

interface ExerciseMdxProps {
  title: string;
  language: "python" | "typescript";
  children: ReactNode;
}

interface SectionMdxProps {
  number?: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

/**
 * Modo de renderizado del MDX de una lección: "theory" es la pantalla de
 * lectura de siempre (con un CTA por tema hacia su pantalla de práctica);
 * "practice" renderiza el mismo MDX pero filtrado a un solo <Section>
 * (activeTopicSlug) y solo sus <Exercise>/<Hint>, sin <QuizCard>/<Concept>.
 * Ver Section.tsx y frontend/app/lessons/[slug]/practice/[topicSlug].
 */
export type MdxRenderOptions =
  | { mode: "theory"; lessonSlug: string; locale: "es" | "en"; practicableTopicSlugs: Set<string> }
  | { mode: "practice"; activeTopicSlug: string };

/**
 * Mapa de componentes disponibles dentro del MDX de una lección, más
 * estilos base para los elementos HTML que genera el MDX (sin depender de
 * @tailwindcss/typography).
 */
export function createMdxComponents(lessonId: string, opts: MdxRenderOptions): MDXComponents {
  const isPractice = opts.mode === "practice";

  return {
    QuizCard: isPractice ? () => null : (props: QuizCardMdxProps) => <QuizCard {...props} lessonId={lessonId} />,
    QuizOption,
    // Mismo componente Exercise en ambos modos (no un () => null en teoría):
    // Section.tsx detecta `child.type === Exercise` para decidir si muestra
    // el CTA "Practicá este tema", y perdería esa identidad si se swapeara
    // acá. Exercise decide internamente si renderiza según `mode`.
    Exercise: (props: ExerciseMdxProps) => <Exercise {...props} lessonId={lessonId} mode={opts.mode} />,
    Concept: isPractice ? () => null : Concept,
    Hint,
    Section: (props: SectionMdxProps) =>
      isPractice ? (
        <Section {...props} mode="practice" activeTopicSlug={opts.activeTopicSlug} />
      ) : (
        <Section
          {...props}
          mode="theory"
          lessonSlug={opts.lessonSlug}
          locale={opts.locale}
          practicableTopicSlugs={opts.practicableTopicSlugs}
        />
      ),
    h1: (props) => <h1 className="mb-4 mt-8 text-2xl font-bold" {...props} />,
    h2: (props) => <h2 className="mb-3 mt-8 text-xl font-semibold" {...props} />,
    h3: (props) => <h3 className="mb-2 mt-6 text-lg font-semibold" {...props} />,
    p: (props) => <p className="mb-4 leading-relaxed" {...props} />,
    ul: (props) => <ul className="mb-4 list-disc space-y-1 pl-6" {...props} />,
    ol: (props) => <ol className="mb-4 list-decimal space-y-1 pl-6" {...props} />,
    a: (props) => <a className="text-accent underline underline-offset-2" {...props} />,
    blockquote: (props) => (
      <blockquote className="mb-4 border-l-2 border-accent pl-4 text-fg-muted" {...props} />
    ),
    code: (props) => {
      const { className, ...rest } = props;
      // Los bloques ```fenced``` traen className="language-x"; el código inline no.
      if (className) return <code className={className} {...rest} />;
      return <code className="rounded bg-bg-subtle px-1.5 py-0.5 text-sm" {...rest} />;
    },
    pre: (props) => (
      <pre className="mb-4 overflow-x-auto rounded-lg border border-border bg-bg-subtle p-4 text-sm" {...props} />
    ),
  };
}
