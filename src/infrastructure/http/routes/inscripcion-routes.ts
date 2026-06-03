import { type FastifyInstance } from "fastify";
import { type InscripcionController } from "../controllers/inscripcion-controller.ts";
import { autenticar } from "../auth.ts";

// Rutas REST del recurso "inscripciones". El controlador ya trae sus
// dependencias inyectadas; aquí solo se mapea verbo+ruta a su handler.
//
// Público: crear inscripción (la escuela se inscribe sin cuenta).
// Protegido (preHandler autenticar): consultar registros, panel,
// avanzar estado y eliminar son acciones exclusivas del gestor.
export function registrarRutasInscripcion(
  app: FastifyInstance,
  c: InscripcionController,
): void {
  const soloGestor = { preHandler: autenticar };

  app.post("/api/inscripciones", c.crear);
  // Catálogo público para el dropdown del formulario (datos abiertos del DENUE
  // + bloqueo de escuelas con jornada concluida). Sin datos del expediente.
  app.get("/api/catalogo", c.catalogo);
  app.get("/api/inscripciones", soloGestor, c.listar);
  app.post("/api/inscripciones/:id/avanzar", soloGestor, c.avanzar);
  app.delete("/api/inscripciones/:id", soloGestor, c.eliminar);
  app.get("/api/panel", soloGestor, c.obtenerPanel);
  app.get("/api/bitacora", soloGestor, c.obtenerBitacora);
  // Mapa de escuelas: revela folio, niños y enlace responsable → solo gestor.
  app.get("/api/escuelas", soloGestor, c.escuelas);
}
