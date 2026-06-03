import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../../config/env.ts";
import * as schema from "./schema.pg.ts";

// Cliente PostgreSQL para producción. Este módulo solo se importa cuando
// DB_DRIVER=postgres (carga diferida en la composición), así que en dev con
// SQLite ni siquiera se abre una conexión a Postgres.
//
// En Render se usa la "Internal Database URL" (misma red privada, sin SSL).
// Si se conecta desde fuera, la URL debe incluir ?sslmode=require.
const sql = postgres(env.DATABASE_URL, { max: 5 });

export const pgDb = drizzle(sql, { schema });

// Migración idempotente de respaldo. En algunos entornos de despliegue
// `drizzle-kit push` crea tablas nuevas pero no agrega columnas a tablas que
// ya existían; estas sentencias `IF NOT EXISTS` garantizan que el esquema esté
// completo en cada arranque, sin pérdida de datos.
export async function ensureSchemaPg(): Promise<void> {
  await sql`ALTER TABLE encuestas ADD COLUMN IF NOT EXISTS prestador text`;
  await sql`ALTER TABLE encuestas ADD COLUMN IF NOT EXISTS escuela text`;
  await sql`ALTER TABLE encuestas ADD COLUMN IF NOT EXISTS puntualidad integer`;
  await sql`ALTER TABLE encuestas ADD COLUMN IF NOT EXISTS calidad_taller integer`;
  await sql`ALTER TABLE encuestas ADD COLUMN IF NOT EXISTS trato integer`;
  await sql`CREATE TABLE IF NOT EXISTS propuestas (
    id text PRIMARY KEY,
    titulo text NOT NULL,
    descripcion text NOT NULL,
    escuela text NOT NULL DEFAULT '',
    apoyos integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL
  )`;
}
