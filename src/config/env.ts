import { z } from "zod";

// Validación estricta del entorno. La app se niega a arrancar si falta
// o es inválida cualquier variable: fallar rápido > fallar en runtime.
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  DB_DRIVER: z.enum(["sqlite", "postgres"]).default("sqlite"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatorio"),
  ZDR_LOGS: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),

  // --- Autenticación del gestor (cuenta única para el MVP) ---
  GESTOR_USUARIO: z.string().min(1).default("gestor"),
  GESTOR_PASSWORD: z.string().min(8, "GESTOR_PASSWORD: mínimo 8 caracteres."),
  // Secreto para firmar los JWT de sesión. En producción debe ser largo y
  // aleatorio; nunca compartirlo ni subirlo al repositorio.
  JWT_SECRET: z.string().min(16, "JWT_SECRET: mínimo 16 caracteres."),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    // No usamos console.log con datos sensibles; aquí solo nombres de vars.
    throw new Error(`Variables de entorno inválidas:\n${issues}`);
  }
  return parsed.data;
}

export const env = loadEnv();
