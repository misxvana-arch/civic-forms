import { type CatalogoEscuelas } from "../ports/catalogo-escuelas.ts";
import { type InscripcionRepository } from "../ports/inscripcion-repository.ts";
import { normalizarNombreEscuela } from "./normalizar-escuela.ts";
import { detectarBarrio } from "../geo/barrios.ts";

// Vista PÚBLICA del catálogo para el formulario de inscripción. A diferencia
// de EscuelaMapa (gestor-only), expone SOLO datos abiertos del DENUE más un
// booleano de bloqueo. Nunca incluye folio, niños ni enlace (ZDR / mínima
// exposición): el formulario es público y no debe filtrar el expediente.
export interface EscuelaParaInscribir {
  readonly nombre: string;
  readonly sostenimiento: "Pública" | "Privada" | "Desconocido";
  readonly domicilio: string;
  readonly telefono: string;
  readonly correo: string;
  // Barrio del Centro Histórico detectado por la ubicación (null si está fuera).
  readonly barrio: string | null;
  // true => ya existe un expediente CONCLUIDO con este nombre: no se reinscribe.
  readonly yaConcluida: boolean;
}

export class ListarCatalogoInscripcion {
  constructor(
    private readonly catalogo: CatalogoEscuelas,
    private readonly repo: InscripcionRepository,
  ) {}

  async execute(): Promise<ReadonlyArray<EscuelaParaInscribir>> {
    const [escuelas, inscripciones] = await Promise.all([
      this.catalogo.todas(),
      this.repo.listar(),
    ]);

    // Conjunto de nombres normalizados cuya jornada YA concluyó.
    const concluidas = new Set<string>();
    for (const ins of inscripciones) {
      if (ins.estado !== "Concluido") continue;
      const clave = normalizarNombreEscuela(ins.nombre);
      if (clave) concluidas.add(clave);
    }

    return escuelas.map((e) => ({
      nombre: e.nombre,
      sostenimiento: e.sostenimiento,
      domicilio: e.domicilio,
      telefono: e.telefono,
      correo: e.correo,
      barrio: detectarBarrio(e.lat, e.lng),
      yaConcluida: concluidas.has(normalizarNombreEscuela(e.nombre)),
    }));
  }
}
