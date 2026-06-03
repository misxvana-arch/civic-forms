import { defineConfig } from "drizzle-kit";
import { env } from "./src/config/env.ts";

// Drizzle Kit usa el mismo env validado que la app, para no divergir.
// El esquema depende del motor: pg-core en producción, sqlite-core en dev.
const esPostgres = env.DB_DRIVER === "postgres";

export default defineConfig({
  schema: esPostgres
    ? "./src/infrastructure/db/schema.pg.ts"
    : "./src/infrastructure/db/schema.ts",
  out: "./drizzle",
  dialect: esPostgres ? "postgresql" : "sqlite",
  dbCredentials: { url: env.DATABASE_URL },
});
