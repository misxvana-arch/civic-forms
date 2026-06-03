import { type Inscripcion } from "../../domain/entities/inscripcion.ts";
import { type Estado } from "../../domain/entities/estado.ts";
import {
  type CatalogoEscuelas,
  type EscuelaCatalogo,
} from "../ports/catalogo-escuelas.ts";
import { type InscripcionRepository } from "../ports/inscripcion-repository.ts";
import { normalizarNombreEscuela as normalizar } from "./normalizar-escuela.ts";

// estadoPlatica === null  => la escuela del catálogo no está inscrita aún.
export interface EscuelaMapa extends EscuelaCatalogo {
  readonly estadoPlatica: Estado | null;
  readonly folio: string | null;
  readonly cct: string | null;
  readonly ninos: number | null;
  readonly fecha: string | null;
  readonly hora: string | null;
  readonly enlace: string | null;
}

// Si dos inscripciones normalizan al mismo nombre, nos quedamos con la más
// avanzada (un punto verde "Concluido" pesa más que uno "En solicitud").
const ORDEN: Record<Estado, number> = {
  "En solicitud": 0,
  Aprobado: 1,
  Programado: 2,
  Concluido: 3,
};

// Cruza el catálogo de escuelas (CSV) con las inscripciones reales por nombre
// normalizado, para pintar en el mapa el estado de la plática de cada escuela.
export class ListarEscuelasMapa {
  constructor(
    private readonly catalogo: CatalogoEscuelas,
    private readonly repo: InscripcionRepository,
  ) {}

  async execute(): Promise<ReadonlyArray<EscuelaMapa>> {
    const [escuelas, inscripciones] = await Promise.all([
      this.catalogo.todas(),
      this.repo.listar(),
    ]);

    const porNombre = new Map<string, Inscripcion>();
    for (const ins of inscripciones) {
      const clave = normalizar(ins.nombre);
      if (!clave) continue;
      const previa = porNombre.get(clave);
      if (!previa || ORDEN[ins.estado] > ORDEN[previa.estado]) {
        porNombre.set(clave, ins);
      }
    }

    return escuelas.map((e) => {
      const m = porNombre.get(normalizar(e.nombre)) ?? null;
      return {
        ...e,
        estadoPlatica: m ? m.estado : null,
        folio: m ? m.folio : null,
        cct: m ? m.cct : null,
        ninos: m ? m.ninos : null,
        fecha: m ? m.fecha : null,
        hora: m ? m.hora : null,
        enlace: m ? m.enlace : null,
      };
    });
  }
}
