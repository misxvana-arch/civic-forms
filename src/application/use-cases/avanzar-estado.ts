import { type Inscripcion } from "../../domain/entities/inscripcion.ts";
import { type Estado, siguienteEstado } from "../../domain/entities/estado.ts";
import { InscripcionNoEncontradaError } from "../../domain/errors/domain-error.ts";
import { type InscripcionRepository } from "../ports/inscripcion-repository.ts";

export interface ResultadoAvance {
  readonly inscripcion: Inscripcion;
  readonly estadoAnterior: Estado;
}

export class AvanzarEstado {
  constructor(private readonly repo: InscripcionRepository) {}

  async execute(id: string): Promise<ResultadoAvance> {
    const actual = await this.repo.buscarPorId(id);
    if (actual === null) throw new InscripcionNoEncontradaError();

    // La máquina de estados decide el siguiente paso (o rechaza si es final).
    const estado = siguienteEstado(actual.estado);
    await this.repo.actualizarEstado(id, estado);
    // Devolvemos también el estado previo para que la bitácora registre la
    // transición completa (ej. "En solicitud → Aprobado").
    return { inscripcion: { ...actual, estado }, estadoAnterior: actual.estado };
  }
}
