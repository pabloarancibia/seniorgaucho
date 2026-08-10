"use client";

import { useEffect, useId, useState } from "react";
import { useTheme } from "@/lib/theme/ThemeProvider";

interface MermaidChartProps {
  definition: string;
}

/**
 * Mermaid toca `document` en cuanto se importa, así que el import va adentro
 * de un useEffect (nunca corre en el server) en vez de un import estático
 * arriba del archivo — evita tener que envolver este componente entero con
 * next/dynamic({ ssr: false }) como sí hace falta para @monaco-editor/react.
 */
export function MermaidChart({ definition }: MermaidChartProps) {
  const { theme } = useTheme();
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    import("mermaid").then(async ({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === "dark" ? "dark" : "default",
        securityLevel: "strict",
      });
      const { svg: rendered } = await mermaid.render(`chart-${id}`, definition);
      if (!cancelled) setSvg(rendered);
    });

    return () => {
      cancelled = true;
    };
  }, [definition, theme, id]);

  if (!svg) {
    return <div className="flex h-48 items-center justify-center text-sm text-fg-muted">…</div>;
  }

  return <div className="[&_svg]:mx-auto [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />;
}
