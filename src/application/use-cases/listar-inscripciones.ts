import { type Inscripcion } from "../../domain/entities/inscripcion.ts";
import { type InscripcionRepository } from "../ports/inscripcion-repository.ts";

export class ListarInscripciones {
  constructor(private readonly repo: InscripcionRepository) {}

  async execute(filtro?: string): Promise<ReadonlyArray<Inscripcion>> {
    return this.repo.listar(filtro);
  }
}
