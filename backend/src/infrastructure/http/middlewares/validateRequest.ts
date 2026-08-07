import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { ValidationError } from "@shared/errors/AppError.js";

type RequestSource = "body" | "params" | "query";

/**
 * Valida una parte del request contra un schema Zod y reemplaza esa parte
 * por los datos parseados (coercionados/limpios). Si falla, lanza
 * ValidationError con los issues de Zod para que el errorHandler global
 * responda con un 400 consistente.
 */
export function validateRequest(schema: ZodType, source: RequestSource): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(new ValidationError("Datos de la petición inválidos", result.error.flatten()));
      return;
    }

    if (source === "query") {
      // Express 5: req.query es un getter sin setter, hay que redefinir la propiedad.
      Object.defineProperty(req, "query", {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else {
      req[source] = result.data;
    }

    next();
  };
}
