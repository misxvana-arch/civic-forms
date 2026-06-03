import { type Propuesta } from "../../domain/entities/propuesta.ts";
import { type PropuestaRepository } from "../ports/propuesta-repository.ts";

export class ListarPropuestas {
  constructor(private readonly repo: PropuestaRepository) {}

  async execute(): Promise<ReadonlyArray<Propuesta>> {
    return this.repo.listar();
  }
}
