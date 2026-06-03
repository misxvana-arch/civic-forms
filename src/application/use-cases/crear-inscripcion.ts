import { randomUUID } from "node:crypto";
import {
  type DatosInscripcion,
  type Inscripcion,
  generarFolio,
  normalizarCct,
} from "../../domain/entities/inscripcion.ts";
import { ESTADO_INICIAL } from "../../domain/entities/estado.ts";
import {
  CctDuplicadoError,
  ConsentimientoRequeridoError,
  EscuelaConcluidaError,
} from "../../domain/errors/domain-error.ts";
import { type InscripcionRepository } from "../ports/inscripcion-repository.ts";
import { normalizarNombreEscuela } from "./normalizar-escuela.ts";

export class CrearInscripcion {
  constructor(private readonly repo: InscripcionRepository) {}

  async execute(
    datos: DatosInscripcion,
    consentimiento: boolean,
  ): Promise<Inscripcion> {
    // Regla legal: sin consentimiento del aviso de privacidad no se procesa
    // ningún dato. Se valida también aquí, no solo en el formulario.
    if (!consentimiento) throw new ConsentimientoRequeridoError();

    const cct = normalizarCct(datos.cct);

    // Unicidad de CCT: una escuela no puede inscribirse dos veces.
    if (await this.repo.existePorCct(cct)) {
      throw new CctDuplicadoError();
    }

    // Bloqueo por jornada concluida: si ya existe un expediente CONCLUIDO con
    // el mismo nombre (normalizado), la escuela ya recibió su plática y no
    // puede volver a inscribirse. Se valida en el servidor, no solo en el
    // formulario: el bloqueo del frontend es UX, esta guarda es la garantía.
    const nombreNorm = normalizarNombreEscuela(datos.nombre);
    if (nombreNorm) {
      const existentes = await this.repo.listar();
      const yaConcluida = existentes.some(
        (i) =>
          i.estado === "Concluido" &&
          normalizarNombreEscuela(i.nombre) === nombreNorm,
      );
      if (yaConcluida) throw new EscuelaConcluidaError();
    }

    const consecutivo = (await this.repo.contar()) + 1;
    const ahora = new Date();

    const inscripcion: Inscripcion = {
      ...datos,
      cct,
      id: randomUUID(),
      folio: generarFolio(cct, consecutivo),
      estado: ESTADO_INICIAL,
      consentAt: ahora,
      createdAt: ahora,
    };

    await this.repo.guardar(inscripcion);
    return inscripcion;
  }
}
