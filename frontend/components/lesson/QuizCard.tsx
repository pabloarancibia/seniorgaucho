"use client";

import { Children, cloneElement, isValidElement, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api/client";
import type { QuizOptionProps } from "@/components/lesson/QuizOption";

interface QuizCardProps {
  questionId: string;
  question: string;
  correctOption: string;
  /** Texto que se muestra debajo de la respuesta una vez seleccionada. */
  explanation?: string;
  /** <QuizOption value="...">Label</QuizOption> por cada alternativa. */
  children: ReactNode;
  /** Inyectado por MdxContent, no lo pasa el autor del MDX. */
  lessonId?: string;
}

/**
 * Las opciones se pasan como hijos JSX (<QuizOption>), no como prop-array,
 * a propósito: next-mdx-remote bloquea expresiones JS en atributos MDX por
 * default (el contenido viene de la DB, no de archivos confiables del repo),
 * así que un array/objeto en un atributo se descartaría en runtime.
 */
export function QuizCard({ questionId, question, correctOption, explanation, children, lessonId }: QuizCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!lessonId) return;
    api
      .listQuizAnswers(lessonId)
      .then((answers) => {
        const previous = answers.find((a) => a.questionId === questionId);
        if (previous) setSelected(previous.selectedOption);
      })
      .catch(() => {
        // Sin respuesta previa persistida, se arranca en blanco.
      });
  }, [lessonId, questionId]);

  const handleSelect = async (value: string): Promise<void> => {
    setSelected(value);
    if (!lessonId) return;

    setSubmitting(true);
    try {
      await api.submitQuizAnswer(lessonId, questionId, value, value === correctOption);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="not-prose my-4 rounded-lg border border-border bg-bg-subtle p-4">
      <p className="mb-3 font-medium">{question}</p>
      <div className="flex flex-col gap-2">
        {Children.map(children, (child) => {
          if (!isValidElement<QuizOptionProps>(child)) return child;

          const isSelected = selected === child.props.value;
          const isCorrect = child.props.value === correctOption;

          return cloneElement(child, {
            onSelect: () => handleSelect(child.props.value),
            state: !isSelected ? "idle" : isCorrect ? "correct" : "incorrect",
            disabled: submitting,
          });
        })}
      </div>
      {selected && (
        <div className="mt-3 space-y-1 text-sm">
          <p className="text-fg-muted">{selected === correctOption ? "✅ Correcto" : "❌ Incorrecto"}</p>
          {explanation && <p className="text-fg-muted">{explanation}</p>}
        </div>
      )}
    </div>
  );
}
