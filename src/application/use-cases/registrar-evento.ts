import {
  type EventoBitacora,
  type NuevoEvento,
} from "../../domain/entities/evento-bitacora.ts";
import { type BitacoraRepository } from "../ports/bitacora-repository.ts";

// Registra una acción del gestor en la bitácora de auditoría.
export class RegistrarEvento {
  constructor(private readonly repo: BitacoraRepository) {}

  async execute(evento: NuevoEvento): Promise<EventoBitacora> {
    return this.repo.registrar(evento);
  }
}
