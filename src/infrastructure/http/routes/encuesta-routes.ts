import { type FastifyInstance } from "fastify";
import { type EncuestaController } from "../controllers/encuesta-controller.ts";
import { autenticar } from "../auth.ts";

// Encuesta de satisfacción:
//   POST /api/encuestas          → público (responde el participante)
//   GET  /api/encuestas/resumen  → gestor (resultados agregados)
export function registrarRutasEncuesta(
  app: FastifyInstance,
  c: EncuestaController,
): void {
  app.post("/api/encuestas", c.enviar);
  app.get("/api/encuestas/resumen", { preHandler: autenticar }, c.resumen);
}
