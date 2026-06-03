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
