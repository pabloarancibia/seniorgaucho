import type { ErrorRequestHandler } from "express";
import { AppError, ValidationError } from "@shared/errors/AppError.js";

/**
 * Middleware global de errores. Debe registrarse último en la cadena.
 * Traduce AppError (dominio/aplicación) a respuestas HTTP consistentes;
 * cualquier otro error se trata como 500 sin filtrar detalles internos.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err instanceof ValidationError && err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    error: { code: "INTERNAL_SERVER_ERROR", message: "Ha ocurrido un error inesperado" },
  });
};
