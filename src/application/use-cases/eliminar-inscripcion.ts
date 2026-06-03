import { InscripcionNoEncontradaError } from "../../domain/errors/domain-error.ts";
import { type InscripcionRepository } from "../ports/inscripcion-repository.ts";

export class EliminarInscripcion {
  constructor(private readonly repo: InscripcionRepository) {}

  // Devuelve el folio eliminado para que la bitácora pueda identificar el
  // expediente afectado (la fila ya no existirá tras el borrado).
  async execute(id: string): Promise<string> {
    const actual = await this.repo.buscarPorId(id);
    if (actual === null) throw new InscripcionNoEncontradaError();

    await this.repo.eliminar(id);
    return actual.folio;
  }
}
