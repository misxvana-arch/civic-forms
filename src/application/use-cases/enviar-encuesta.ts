import { randomUUID } from "node:crypto";
import {
  type DatosEncuesta,
  type Encuesta,
  calificacionValida,
} from "../../domain/entities/encuesta.ts";
import { CalificacionInvalidaError } from "../../domain/errors/domain-error.ts";
import { type EncuestaRepository } from "../ports/encuesta-repository.ts";

export class EnviarEncuesta {
  constructor(private readonly repo: EncuestaRepository) {}

  async execute(datos: DatosEncuesta): Promise<Encuesta> {
    // Invariante de dominio: la escala se respeta aunque el cliente falle.
    if (!calificacionValida(datos.calificacion)) {
      throw new CalificacionInvalidaError();
    }

    const encuesta: Encuesta = {
      ...datos,
      id: randomUUID(),
      createdAt: new Date(),
    };

    await this.repo.guardar(encuesta);
    return encuesta;
  }
}
