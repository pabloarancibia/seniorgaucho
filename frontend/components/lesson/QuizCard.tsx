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
 * PRNG sembrado (xorshift32) a partir de un string — determinístico: la
 * misma seed siempre da la misma secuencia. Necesario porque QuizCard es
 * un client component que TAMBIÉN se renderiza en el servidor (RSC/SSR):
 * si usáramos Math.random() sin sembrar, el server calcularía un orden y
 * el cliente otro distinto al hidratar, lo que React reporta como un
 * mismatch de hidratación. Sembrando con `questionId` (mismo valor en
 * server y cliente), ambos lados calculan exactamente el mismo orden.
 */
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  let state = hash === 0 ? 1 : hash >>> 0; // xorshift no puede arrancar en 0
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0xffffffff;
  };
}

/**
 * Fisher-Yates con el PRNG sembrado de arriba — a propósito NO usamos
 * `.sort(() => random() - 0.5)`: además de no ser uniforme, distintos
 * motores JS (V8 en el server, el motor del browser del usuario) pueden
 * invocar el comparador una cantidad distinta de veces, consumiendo la
 * secuencia sembrada de forma distinta y reintroduciendo el mismatch que
 * estamos evitando. Fisher-Yates es un algoritmo explícito: mismo input +
 * misma seed = mismo resultado, sin importar el motor.
 */
function shuffle<T>(items: readonly T[], seed: string): T[] {
  const result = [...items];
  const random = seededRandom(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
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
  // Orden fijo por pregunta (no por instancia/reload): en el MDX la opción
  // correcta casi siempre se escribe primero porque es lo más natural al
  // redactar, así que mostrarlas en el orden literal del contenido las
  // hace adivinables por posición sin saber la respuesta.
  const [shuffledChildren] = useState(() => shuffle(Children.toArray(children), questionId));

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
        {shuffledChildren.map((child) => {
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
