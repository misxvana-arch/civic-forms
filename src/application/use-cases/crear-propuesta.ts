import { randomUUID } from "node:crypto";
import {
  type DatosPropuesta,
  type Propuesta,
} from "../../domain/entities/propuesta.ts";
import { type PropuestaRepository } from "../ports/propuesta-repository.ts";

export class CrearPropuesta {
  constructor(private readonly repo: PropuestaRepository) {}

  async execute(datos: DatosPropuesta): Promise<Propuesta> {
    const propuesta: Propuesta = {
      ...datos,
      id: randomUUID(),
      apoyos: 0,
      createdAt: new Date(),
    };
    await this.repo.guardar(propuesta);
    return propuesta;
  }
}
