import { type FastifyInstance } from "fastify";
import { type ParticipacionController } from "../controllers/participacion-controller.ts";

// Rutas de participación ciudadana y Gobierno Abierto. Todas PÚBLICAS:
//   GET  /api/prestadores          → catálogo para el desplegable de la encuesta
//   GET  /api/transparencia        → resultados agregados (transparencia)
//   GET  /api/propuestas           → listado de propuestas de co-creación
//   POST /api/propuestas           → registrar una propuesta
//   POST /api/propuestas/:id/apoyar→ sumar un apoyo
export function registrarRutasParticipacion(
  app: FastifyInstance,
  c: ParticipacionController,
): void {
  app.get("/api/prestadores", c.prestadores);
  app.get("/api/transparencia", c.transparencia);
  app.get("/api/propuestas", c.listarPropuestas);
  app.post("/api/propuestas", c.crearPropuesta);
  app.post("/api/propuestas/:id/apoyar", c.apoyarPropuesta);
}
