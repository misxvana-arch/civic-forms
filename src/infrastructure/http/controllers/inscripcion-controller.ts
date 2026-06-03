import { type FastifyReply, type FastifyRequest } from "fastify";
import { crearInscripcionSchema } from "../dto/inscripcion-dto.ts";
import { type CrearInscripcion } from "../../../application/use-cases/crear-inscripcion.ts";
import { type ListarInscripciones } from "../../../application/use-cases/listar-inscripciones.ts";
import { type AvanzarEstado } from "../../../application/use-cases/avanzar-estado.ts";
import { type EliminarInscripcion } from "../../../application/use-cases/eliminar-inscripcion.ts";
import { type ObtenerPanel } from "../../../application/use-cases/obtener-panel.ts";
import { type RegistrarEvento } from "../../../application/use-cases/registrar-evento.ts";
import { type ListarBitacora } from "../../../application/use-cases/listar-bitacora.ts";
import { type ListarEscuelasMapa } from "../../../application/use-cases/listar-escuelas-mapa.ts";
import { type ListarCatalogoInscripcion } from "../../../application/use-cases/listar-catalogo-inscripcion.ts";

interface Deps {
  readonly crear: CrearInscripcion;
  readonly listar: ListarInscripciones;
  readonly avanzar: AvanzarEstado;
  readonly eliminar: EliminarInscripcion;
  readonly panel: ObtenerPanel;
  readonly registrarEvento: RegistrarEvento;
  readonly listarBitacora: ListarBitacora;
  readonly escuelasMapa: ListarEscuelasMapa;
  readonly catalogoInscripcion: ListarCatalogoInscripcion;
}

export class InscripcionController {
  constructor(private readonly deps: Deps) {}

  crear = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const parsed = crearInscripcionSchema.safeParse(req.body);
    if (!parsed.success) {
      // Errores de forma → 422 con detalle por campo, SIN eco del valor.
      reply.status(422).send({
        error: "VALIDATION_ERROR",
        campos: parsed.error.issues.map((i) => ({
          campo: String(i.path[0] ?? ""),
          motivo: i.message,
        })),
      });
      return;
    }
    const { consent, ...datos } = parsed.data;
    const inscripcion = await this.deps.crear.execute(datos, consent);
    reply.status(201).send(inscripcion);
  };

  listar = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const q = (req.query as { q?: string }).q;
    const inscripciones = await this.deps.listar.execute(q);
    reply.send(inscripciones);
  };

  avanzar = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = req.params as { id: string };
    const { inscripcion, estadoAnterior } = await this.deps.avanzar.execute(id);
    // Auditoría: queda registrada la transición de estado y su autor.
    await this.deps.registrarEvento.execute({
      actor: req.user.usuario,
      accion: "AVANZAR_ESTADO",
      folio: inscripcion.folio,
      detalle: `${estadoAnterior} → ${inscripcion.estado}`,
    });
    reply.send(inscripcion);
  };

  eliminar = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = req.params as { id: string };
    const folio = await this.deps.eliminar.execute(id);
    // Auditoría: el borrado de un expediente queda asentado con su autor.
    await this.deps.registrarEvento.execute({
      actor: req.user.usuario,
      accion: "ELIMINAR",
      folio,
      detalle: "Expediente eliminado",
    });
    reply.status(204).send();
  };

  obtenerPanel = async (
    _req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    reply.send(await this.deps.panel.execute());
  };

  obtenerBitacora = async (
    _req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    reply.send(await this.deps.listarBitacora.execute());
  };

  escuelas = async (
    _req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    // Catálogo de escuelas cruzado con el estado de la plática de cada una.
    reply.send(await this.deps.escuelasMapa.execute());
  };

  catalogo = async (
    _req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    // Catálogo PÚBLICO para el formulario: datos abiertos + bloqueo concluida.
    reply.send(await this.deps.catalogoInscripcion.execute());
  };
}
