import { type FastifyReply, type FastifyRequest } from "fastify";
import { crearPropuestaSchema } from "../dto/propuesta-dto.ts";
import { PRESTADORES_OPCIONES } from "../../../domain/catalogos/prestadores.ts";
import { type ObtenerTransparencia } from "../../../application/use-cases/obtener-transparencia.ts";
import { type CrearPropuesta } from "../../../application/use-cases/crear-propuesta.ts";
import { type ListarPropuestas } from "../../../application/use-cases/listar-propuestas.ts";
import { type ApoyarPropuesta } from "../../../application/use-cases/apoyar-propuesta.ts";

interface Deps {
  readonly transparencia: ObtenerTransparencia;
  readonly crearPropuesta: CrearPropuesta;
  readonly listarPropuestas: ListarPropuestas;
  readonly apoyarPropuesta: ApoyarPropuesta;
}

// Funciones de participación ciudadana y Gobierno Abierto. Todo es PÚBLICO
// (sin sesión): el catálogo de prestadores para la encuesta, la vista de
// transparencia y la co-creación de propuestas.
export class ParticipacionController {
  constructor(private readonly deps: Deps) {}

  // Catálogo de terceros prestadores (para el desplegable de la encuesta).
  prestadores = async (
    _req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    reply.send(PRESTADORES_OPCIONES);
  };

  // Vista pública de resultados agregados (transparencia).
  transparencia = async (
    _req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    reply.send(await this.deps.transparencia.execute());
  };

  listarPropuestas = async (
    _req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    reply.send(await this.deps.listarPropuestas.execute());
  };

  crearPropuesta = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const parsed = crearPropuestaSchema.safeParse(req.body);
    if (!parsed.success) {
      reply.status(422).send({
        error: "VALIDATION_ERROR",
        campos: parsed.error.issues.map((i) => ({
          campo: String(i.path[0] ?? ""),
          motivo: i.message,
        })),
      });
      return;
    }
    const propuesta = await this.deps.crearPropuesta.execute(parsed.data);
    reply.status(201).send(propuesta);
  };

  apoyarPropuesta = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { id } = req.params as { id: string };
    const propuesta = await this.deps.apoyarPropuesta.execute(id);
    if (!propuesta) {
      reply.status(404).send({ error: "NO_ENCONTRADA" });
      return;
    }
    reply.send(propuesta);
  };
}
