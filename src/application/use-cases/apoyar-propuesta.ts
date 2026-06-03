import { type Propuesta } from "../../domain/entities/propuesta.ts";
import { type PropuestaRepository } from "../ports/propuesta-repository.ts";

export class ApoyarPropuesta {
  constructor(private readonly repo: PropuestaRepository) {}

  // Devuelve la propuesta con su apoyo sumado, o null si no existe.
  async execute(id: string): Promise<Propuesta | null> {
    return this.repo.apoyar(id);
  }
}
