import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Fastify, {
  type FastifyError,
  type FastifyReply,
  type FastifyRequest,
} from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";

import { env } from "../../config/env.ts";
import { DomainError } from "../../domain/errors/domain-error.ts";
import { crearRepositorios } from "../db/factory.ts";
import { CrearInscripcion } from "../../application/use-cases/crear-inscripcion.ts";
import { ListarInscripciones } from "../../application/use-cases/listar-inscripciones.ts";
import { AvanzarEstado } from "../../application/use-cases/avanzar-estado.ts";
import { EliminarInscripcion } from "../../application/use-cases/eliminar-inscripcion.ts";
import { ObtenerPanel } from "../../application/use-cases/obtener-panel.ts";
import { RegistrarEvento } from "../../application/use-cases/registrar-evento.ts";
import { ListarBitacora } from "../../application/use-cases/listar-bitacora.ts";
import { ListarEscuelasMapa } from "../../application/use-cases/listar-escuelas-mapa.ts";
import { ListarCatalogoInscripcion } from "../../application/use-cases/listar-catalogo-inscripcion.ts";
import { CsvCatalogoEscuelas } from "../escuelas/csv-catalogo-escuelas.ts";
import { EnviarEncuesta } from "../../application/use-cases/enviar-encuesta.ts";
import { ObtenerResumenEncuestas } from "../../application/use-cases/obtener-resumen-encuestas.ts";
import { InscripcionController } from "./controllers/inscripcion-controller.ts";
import { EncuestaController } from "./controllers/encuesta-controller.ts";
import { registrarRutasInscripcion } from "./routes/inscripcion-routes.ts";
import { registrarRutasEncuesta } from "./routes/encuesta-routes.ts";
import { registrarRutasAuth } from "./routes/auth-routes.ts";

// --- Composición de dependencias (composition root) ---
// Único lugar donde se eligen implementaciones concretas. Cambiar de
// SQLite a Postgres = cambiar solo esta línea del repositorio.
// Elige SQLite (dev) o PostgreSQL (prod) según DB_DRIVER, cargando solo el
// driver necesario. Es un await de nivel superior: la app no atiende
// peticiones hasta tener su capa de datos lista.
const {
  inscripcion: repo,
  bitacora: bitacoraRepo,
  encuesta: encuestaRepo,
} = await crearRepositorios();
// Catálogo de escuelas: fuente externa (CSV del DENUE) en la raíz del proyecto.
const catalogoEscuelas = new CsvCatalogoEscuelas();
const controller = new InscripcionController({
  crear: new CrearInscripcion(repo),
  listar: new ListarInscripciones(repo),
  avanzar: new AvanzarEstado(repo),
  eliminar: new EliminarInscripcion(repo),
  panel: new ObtenerPanel(repo, catalogoEscuelas),
  registrarEvento: new RegistrarEvento(bitacoraRepo),
  listarBitacora: new ListarBitacora(bitacoraRepo),
  escuelasMapa: new ListarEscuelasMapa(catalogoEscuelas, repo),
  catalogoInscripcion: new ListarCatalogoInscripcion(catalogoEscuelas, repo),
});
const encuestaController = new EncuestaController({
  enviar: new EnviarEncuesta(encuestaRepo),
  resumen: new ObtenerResumenEncuestas(encuestaRepo),
});

const app = Fastify({
  // ZDR: el logger nunca registra el cuerpo de la petición (datos del
  // ciudadano). Solo método, ruta y código de respuesta.
  logger: { level: env.NODE_ENV === "production" ? "warn" : "info" },
  disableRequestLogging: false,
  // En Render (y cualquier PaaS) la app corre detrás de un proxy que
  // termina TLS. trustProxy permite leer el protocolo/IP originales.
  trustProxy: true,
});

// CORS con credenciales: el navegador debe poder enviar la cookie de sesión
// en las peticiones a la API.
await app.register(cors, { origin: true, credentials: true });

// Cookies + JWT. El token de sesión se lee desde la cookie httpOnly
// "sgi_session"; no usamos firma de cookie aparte (el JWT ya va firmado).
await app.register(cookie);
await app.register(jwt, {
  secret: env.JWT_SECRET,
  cookie: { cookieName: "sgi_session", signed: false },
});

// Servir el portal (HTML) en la raíz. En prod se cachea en memoria; en dev
// se lee fresco cada vez para iterar sin reiniciar el servidor.
const aquí = dirname(fileURLToPath(import.meta.url));
const rutaHtml = join(aquí, "../../../public/index.html");
const htmlCache =
  env.NODE_ENV === "production" ? readFileSync(rutaHtml, "utf8") : null;
app.get("/", async (_req, reply) => {
  const html = htmlCache ?? readFileSync(rutaHtml, "utf8");
  reply.type("text/html").send(html);
});

app.get("/salud", async () => ({ ok: true }));

registrarRutasAuth(app);
registrarRutasInscripcion(app, controller);
registrarRutasEncuesta(app, encuestaController);

// Mapeo central de errores. Las reglas de negocio salen como 4xx con su
// código; lo demás es 500 genérico (sin filtrar datos sensibles).
app.setErrorHandler(
  (error: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
  if (error instanceof DomainError) {
    reply
      .status(error.httpStatus)
      .send({ error: error.code, mensaje: error.message });
    return;
  }
  if (/UNIQUE constraint failed/i.test(error.message)) {
    reply.status(409).send({
      error: "CCT_DUPLICADO",
      mensaje: "Esta escuela (CCT) ya está inscrita.",
    });
    return;
  }
  // ZDR: registramos solo el nombre del error, nunca el payload.
  req.log.error({ err: error.name }, "error no controlado");
  reply
    .status(500)
    .send({ error: "INTERNAL", mensaje: "Error interno del servidor." });
});

app
  .listen({ port: env.PORT, host: "0.0.0.0" })
  .then(() => {
    app.log.info(`SGI escuchando en http://localhost:${env.PORT}`);
  })
  .catch((err: unknown) => {
    app.log.error({ err: (err as Error).name }, "no se pudo iniciar");
    process.exit(1);
  });
