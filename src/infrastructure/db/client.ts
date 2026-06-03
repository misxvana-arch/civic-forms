import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { env } from "../../config/env.ts";
import * as schema from "./schema.ts";

// Dev local usa SQLite (cero infraestructura, ideal para demo de clase).
// En producción se conectaría Postgres; el repositorio aísla al dominio,
// así que ese cambio no toca casos de uso ni entidades.
if (env.DB_DRIVER !== "sqlite") {
  throw new Error(
    "Solo el driver 'sqlite' está implementado por ahora. " +
      "Para Postgres, agrega un cliente pg y su repositorio.",
  );
}

const sqlite = new Database(env.DATABASE_URL);
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });
