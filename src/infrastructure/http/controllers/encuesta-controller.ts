import { type FastifyReply, type FastifyRequest } from "fastify";
import { enviarEncuestaSchema } from "../dto/encuesta-dto.ts";
import { type EnviarEncuesta } from "../../../application/use-cases/enviar-encuesta.ts";
import { type ObtenerResumenEncuestas } from "../../../application/use-cases/obtener-resumen-encuestas.ts";

interface Deps {
  readonly enviar: EnviarEncuesta;
  readonly resumen: ObtenerResumenEncuestas;
}

export class EncuestaController {
  constructor(private readonly deps: Deps) {}

  // Público: cualquier participante puede responder la encuesta.
  enviar = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const parsed = enviarEncuestaSchema.safeParse(req.body);
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
    const encuesta = await this.deps.enviar.execute(parsed.data);
    // Devolvemos solo id y fecha (acuse), no el contenido enviado.
    reply.status(201).send({ id: encuesta.id, createdAt: encuesta.createdAt });
  };

  // Gestor: resumen agregado de la satisfacción.
  resumen = async (
    _req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    reply.send(await this.deps.resumen.execute());
  };
}
