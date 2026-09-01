import "dotenv/config";
import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL es requerido"),
    CORS_ORIGIN: z.string().default("http://localhost:3000"),

    // Proveedor por default si una sesión de chat no especifica uno:
    // anthropic | google | fake. "fake" no necesita ninguna API key —
    // respuestas guionadas, útil para desarrollar sin gastar tokens.
    LLM_PROVIDER: z.enum(["anthropic", "google", "fake"]).default("fake"),
    LLM_EFFORT: z.enum(["low", "medium", "high"]).default("medium"),
    ANTHROPIC_API_KEY: z.string().optional(),
    ANTHROPIC_MODEL: z.string().default("claude-opus-5"),
    GOOGLE_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().default("gemini-3-flash-preview"),
  })
  // El proveedor default tiene que poder arrancar: si es "anthropic"/"google"
  // sin su API key, fallamos rápido en el boot en vez de recién explotar en
  // el primer mensaje del chat.
  .superRefine((value, ctx) => {
    if (value.LLM_PROVIDER === "anthropic" && !value.ANTHROPIC_API_KEY) {
      ctx.addIssue({
        code: "custom",
        path: ["ANTHROPIC_API_KEY"],
        message: "ANTHROPIC_API_KEY es requerido cuando LLM_PROVIDER=anthropic",
      });
    }
    if (value.LLM_PROVIDER === "google" && !value.GOOGLE_API_KEY) {
      ctx.addIssue({
        code: "custom",
        path: ["GOOGLE_API_KEY"],
        message: "GOOGLE_API_KEY es requerido cuando LLM_PROVIDER=google",
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Variables de entorno inválidas:", parsed.error.flatten().fieldErrors);
  throw new Error("Configuración de entorno inválida. Revisa tu archivo .env");
}

export const env = parsed.data;
