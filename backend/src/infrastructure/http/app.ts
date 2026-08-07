import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "@infrastructure/config/env.js";
import { buildContainer } from "@infrastructure/config/container.js";
import { apiRoutes } from "@infrastructure/http/routes/index.js";
import { errorHandler } from "@infrastructure/http/middlewares/errorHandler.js";

/**
 * Fabrica la app de Express. El container (composition root) se construye
 * una vez aquí y se inyecta en las rutas.
 */
export function createApp(): Express {
  const app = express();
  const container = buildContainer();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()) }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", env: env.NODE_ENV });
  });

  app.use("/api", apiRoutes(container));

  app.use(errorHandler);

  return app;
}
