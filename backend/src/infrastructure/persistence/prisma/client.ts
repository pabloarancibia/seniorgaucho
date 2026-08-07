import { PrismaClient } from "@infrastructure/persistence/prisma/generated/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { env } from "@infrastructure/config/env.js";

/**
 * Instancia única de PrismaClient para todo el proceso. Evita agotar el pool
 * de conexiones de SQLite al recargar en modo watch (tsx).
 *
 * Prisma ORM 7 requiere un driver adapter explícito; para producción sobre
 * Postgres solo cambia el adapter (p. ej. @prisma/adapter-pg), el resto del
 * código de dominio/aplicación no se ve afectado.
 */
const adapter = new PrismaBetterSqlite3({ url: env.DATABASE_URL });

export const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
