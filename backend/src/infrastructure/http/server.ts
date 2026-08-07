import { env } from "@infrastructure/config/env.js";
import { prisma } from "@infrastructure/persistence/prisma/client.js";
import { createApp } from "@infrastructure/http/app.js";

async function bootstrap(): Promise<void> {
  await prisma.$connect();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`[backend] listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`[backend] received ${signal}, shutting down...`);
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  console.error("[backend] fatal error during bootstrap:", error);
  process.exit(1);
});
