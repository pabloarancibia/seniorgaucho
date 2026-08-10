import fs from "node:fs";
import path from "node:path";

export default function ZuriboatsPage() {
  const indexPath = path.join(process.cwd(), "public", "zuriboats-docs", "index.html");
  const isSynced = fs.existsSync(indexPath);

  if (!isSynced) {
    return (
      <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-xl font-bold">Zuriboats todavía no está sincronizado</h1>
        <p className="text-sm text-fg-muted">
          Corré <code className="rounded bg-bg-subtle px-1.5 py-0.5">pnpm sync:zuriboats</code> desde la raíz del
          repo para generar el contenido estático, después refrescá esta página.
        </p>
      </div>
    );
  }

  return <iframe src="/zuriboats-docs/index.html" title="Zuriboats" className="h-[calc(100vh-3.5rem)] w-full border-0" />;
}
