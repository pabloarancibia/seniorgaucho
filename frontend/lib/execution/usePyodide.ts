"use client";

import { useCallback, useRef, useState } from "react";
import type { PyodideInterface } from "pyodide";
import type { ExecutionResult, ExecutionStatus } from "@/lib/execution/types";

const PYODIDE_VERSION = "314.0.4";
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

let pyodideBootPromise: Promise<PyodideInterface> | null = null;

function loadScriptOnce(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(script);
  });
}

async function bootPyodide(): Promise<PyodideInterface> {
  await loadScriptOnce(`${PYODIDE_CDN}pyodide.js`);
  if (!window.loadPyodide) {
    throw new Error("pyodide.js se cargó pero no expuso window.loadPyodide");
  }
  return window.loadPyodide({ indexURL: PYODIDE_CDN });
}

/**
 * Ejecuta Python en el browser vía WebAssembly (Pyodide). El runtime (~10MB)
 * se descarga una sola vez por sesión de navegador y se cachea en un módulo
 * global para que cambiar de pestaña no vuelva a bootearlo.
 */
export function usePyodide() {
  const pyodideRef = useRef<PyodideInterface | null>(null);
  const [status, setStatus] = useState<ExecutionStatus>("idle");

  const ensureReady = useCallback(async (): Promise<PyodideInterface> => {
    if (pyodideRef.current) return pyodideRef.current;

    setStatus("booting");
    try {
      if (!pyodideBootPromise) pyodideBootPromise = bootPyodide();
      const pyodide = await pyodideBootPromise;
      pyodideRef.current = pyodide;
      setStatus("ready");
      return pyodide;
    } catch (error) {
      pyodideBootPromise = null;
      setStatus("error");
      throw error;
    }
  }, []);

  const run = useCallback(
    async (code: string): Promise<ExecutionResult> => {
      const pyodide = await ensureReady();
      let output = "";

      pyodide.setStdout({ batched: (msg: string) => { output += `${msg}\n`; } });
      pyodide.setStderr({ batched: (msg: string) => { output += `${msg}\n`; } });

      setStatus("running");
      try {
        await pyodide.runPythonAsync(code);
        setStatus("ready");
        return { output, success: true };
      } catch (error) {
        setStatus("ready");
        return { output: output + String(error), success: false };
      }
    },
    [ensureReady]
  );

  return { run, ensureReady, status };
}
