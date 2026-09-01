"use client";

import type { ReactNode } from "react";

export type QuizOptionState = "idle" | "correct" | "incorrect";

export interface QuizOptionProps {
  value: string;
  children: ReactNode;
  /** Inyectados por QuizCard vía React.cloneElement; el autor del MDX no los pasa. */
  onSelect?: () => void;
  state?: QuizOptionState;
  disabled?: boolean;
}

export function QuizOption({ children, onSelect, state = "idle", disabled }: QuizOptionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={[
        "rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all disabled:opacity-60",
        state === "correct" && "border-emerald-500 bg-emerald-500/10",
        state === "incorrect" && "border-red-500 bg-red-500/10",
        state === "idle" && "border-border hover:-translate-y-0.5 hover:border-accent hover:shadow-sm",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
