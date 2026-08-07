"use client";

import { useCallback, useRef, useState } from "react";
import { WebContainer } from "@webcontainer/api";
import type { ExecutionResult, ExecutionStatus } from "@/lib/execution/types";

let containerBootPromise: Promise<WebContainer> | null = null;

function bootWebContainer(): Promise<WebContainer> {
  if (!containerBootPromise) containerBootPromise = WebContainer.boot();
  return containerBootPromise;
}

/**
 * Ejecuta TypeScript/Node real dentro de un WebContainer (StackBlitz) en el
 * browser. Requiere que la página esté cross-origin-isolated (ver headers
 * COOP/COEP en next.config.ts) porque WebContainers usa SharedArrayBuffer.
 *
 * `tsx` se instala una sola vez al bootear; cada Run solo reescribe
 * index.ts y vuelve a correrlo, para no pagar `npm install` en cada click.
 */
export function useWebContainer() {
  const containerRef = useRef<WebContainer | null>(null);
  const readyRef = useRef<Promise<WebContainer> | null>(null);
  const [status, setStatus] = useState<ExecutionStatus>("idle");

  const ensureReady = useCallback(async (): Promise<WebContainer> => {
    if (containerRef.current) return containerRef.current;
    if (readyRef.current) return readyRef.current;

    readyRef.current = (async () => {
      setStatus("booting");
      const container = await bootWebContainer();

      await container.mount({
        "package.json": {
          file: {
            contents: JSON.stringify(
              { name: "sandbox", private: true, type: "module", dependencies: { tsx: "^4.20.0" } },
              null,
              2
            ),
          },
        },
        "index.ts": { file: { contents: "" } },
      });

      const install = await container.spawn("npm", ["install"]);
      const exitCode = await install.exit;
      if (exitCode !== 0) {
        setStatus("error");
        throw new Error("npm install falló dentro del WebContainer");
      }

      containerRef.current = container;
      setStatus("ready");
      return container;
    })();

    return readyRef.current;
  }, []);

  const run = useCallback(
    async (code: string): Promise<ExecutionResult> => {
      const container = await ensureReady();
      await container.fs.writeFile("index.ts", code);

      setStatus("running");
      const process = await container.spawn("npx", ["tsx", "index.ts"]);
      let output = "";
      await process.output.pipeTo(
        new WritableStream({
          write(chunk) {
            output += chunk;
          },
        })
      );

      const exitCode = await process.exit;
      setStatus("ready");
      return { output, success: exitCode === 0 };
    },
    [ensureReady]
  );

  return { run, ensureReady, status };
}
