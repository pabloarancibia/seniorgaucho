import type { Response } from "express";

/**
 * Escritor de frames Server-Sent Events sobre un Response de Express.
 *
 * POST + stream leído del lado del cliente con fetch()+getReader(), no
 * EventSource — EventSource es GET-only, y el chat de práctica manda el
 * mensaje del usuario en el body del mismo request que abre el stream.
 */
export class SseWriter {
  constructor(private readonly res: Response) {}

  start(): void {
    this.res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    this.res.setHeader("Cache-Control", "no-cache, no-transform");
    this.res.setHeader("Connection", "keep-alive");
    // Evita que un proxy intermedio (nginx, etc.) bufferee la respuesta
    // esperando a tener "suficiente" contenido antes de flushear.
    this.res.setHeader("X-Accel-Buffering", "no");
    this.res.flushHeaders();
  }

  send(event: string, data: unknown): void {
    this.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  /** Comentario SSE (no dispara ningún listener) — mantiene viva la conexión ante proxies que cortan idle connections. */
  heartbeat(): void {
    this.res.write(":\n\n");
  }

  end(): void {
    this.res.end();
  }
}
