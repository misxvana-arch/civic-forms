import { type InscripcionRepository } from "../ports/inscripcion-repository.ts";
import { type CatalogoEscuelas } from "../ports/catalogo-escuelas.ts";
import { ESTADOS, type Estado } from "../../domain/entities/estado.ts";

export interface EstadoConteo {
  readonly estado: Estado;
  readonly total: number;
}

export interface BarrioConteo {
  readonly barrio: string;
  readonly inscritas: number;
  readonly concluidas: number;
}

export interface Panel {
  readonly escuelas: number; // inscripciones = expedientes
  readonly ninos: number;
  readonly publicas: number;
  readonly concluidas: number;
  // Cobertura: total de escuelas del catálogo (denominador).
  readonly totalCatalogo: number;
  readonly porEstado: ReadonlyArray<EstadoConteo>;
  readonly porBarrio: ReadonlyArray<BarrioConteo>;
}

const SIN_UBICACION = "Fuera del Centro Histórico";

export class ObtenerPanel {
  constructor(
    private readonly repo: InscripcionRepository,
    private readonly catalogo: CatalogoEscuelas,
  ) {}

  async execute(): Promise<Panel> {
    const [todas, escuelas] = await Promise.all([
      this.repo.listar(),
      this.catalogo.todas(),
    ]);

    const conteoEstado = new Map<Estado, number>();
    const conteoBarrio = new Map<string, { inscritas: number; concluidas: number }>();
    let ninos = 0;
    let publicas = 0;
    let concluidas = 0;

    for (const i of todas) {
      ninos += i.ninos;
      if (i.sostenimiento === "Pública") publicas++;
      if (i.estado === "Concluido") concluidas++;
      conteoEstado.set(i.estado, (conteoEstado.get(i.estado) ?? 0) + 1);

      // Barrio: tomado del expediente (se autodetectó al inscribir).
      const barrio = i.barrio ?? SIN_UBICACION;
      const acum = conteoBarrio.get(barrio) ?? { inscritas: 0, concluidas: 0 };
      acum.inscritas++;
      if (i.estado === "Concluido") acum.concluidas++;
      conteoBarrio.set(barrio, acum);
    }

    // Todos los estados en su orden natural, incluso los que están en cero.
    const porEstado = ESTADOS.map((estado) => ({
      estado,
      total: conteoEstado.get(estado) ?? 0,
    }));

    const porBarrio = [...conteoBarrio.entries()]
      .map(([barrio, c]) => ({ barrio, ...c }))
      .sort((a, b) => b.inscritas - a.inscritas);

    return {
      escuelas: todas.length,
      ninos,
      publicas,
      concluidas,
      totalCatalogo: escuelas.length,
      porEstado,
      porBarrio,
    };
  }
}
