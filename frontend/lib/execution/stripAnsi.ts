const ANSI_REGEX = /\x1b\[[0-9;]*[a-zA-Z]/g;

/**
 * Saca códigos de escape ANSI (color, movimiento de cursor) de un string.
 * Node/tsx los agrega cuando el proceso corre bajo una pty simulada (como
 * hace WebContainers), pero un <pre> en HTML no los interpreta — se ven
 * como texto crudo tipo `?[33m1?[39m` en vez de aplicarse como estilo.
 */
export function stripAnsi(text: string): string {
  return text.replace(ANSI_REGEX, "");
}
