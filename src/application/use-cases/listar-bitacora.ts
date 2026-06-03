import { type EventoBitacora } from "../../domain/entities/evento-bitacora.ts";
import { type BitacoraRepository } from "../ports/bitacora-repository.ts";

// Devuelve los eventos de la bitácora, del más reciente al más antiguo.
export class ListarBitacora {
  constructor(private readonly repo: BitacoraRepository) {}

  async execute(limite?: number): Promise<ReadonlyArray<EventoBitacora>> {
    return this.repo.listar(limite);
  }
}
