import { type InscripcionRepository } from "../ports/inscripcion-repository.ts";
import { type CatalogoEscuelas } from "../ports/catalogo-escuelas.ts";
import {
  type ObtenerResumenEncuestas,
  type Semaforo,
} from "./obtener-resumen-encuestas.ts";

// Vista PÚBLICA de resultados (Gobierno Abierto). Solo cifras agregadas y no
// sensibles: nunca expone folios, contactos ni comentarios individuales.

export interface PrestadorPublico {
  readonly prestador: string;
  readonly promedio: number;
  readonly total: number;
  readonly semaforo: Semaforo;
}

export interface Transparencia {
  readonly escuelasInscritas: number;
  readonly jornadasConcluidas: number;
  readonly ninosBeneficiados: number; // suma de niñas y niños de jornadas concluidas
  readonly catalogoTotal: number;
  readonly coberturaPct: number; // % del padrón ya inscrito
  readonly satisfaccionPromedio: number;
  readonly porcentajeRecomienda: number;
  readonly totalRespuestas: number;
  readonly desempenoPrestadores: ReadonlyArray<PrestadorPublico>;
}

export class ObtenerTransparencia {
  constructor(
    private readonly repo: InscripcionRepository,
    private readonly catalogo: CatalogoEscuelas,
    private readonly resumen: ObtenerResumenEncuestas,
  ) {}

  async execute(): Promise<Transparencia> {
    const [inscripciones, catalogo, resumen] = await Promise.all([
      this.repo.listar(),
      this.catalogo.todas(),
      this.resumen.execute(),
    ]);

    let jornadasConcluidas = 0;
    let ninosBeneficiados = 0;
    for (const i of inscripciones) {
      if (i.estado === "Concluido") {
        jornadasConcluidas++;
        ninosBeneficiados += i.ninos;
      }
    }

    const catalogoTotal = catalogo.length;
    const coberturaPct =
      catalogoTotal === 0
        ? 0
        : Math.round((inscripciones.length / catalogoTotal) * 1000) / 10;

    return {
      escuelasInscritas: inscripciones.length,
      jornadasConcluidas,
      ninosBeneficiados,
      catalogoTotal,
      coberturaPct,
      satisfaccionPromedio: resumen.promedio,
      porcentajeRecomienda: resumen.porcentajeRecomienda,
      totalRespuestas: resumen.total,
      // Solo promedio general por prestador (sin comentarios ni detalle).
      desempenoPrestadores: resumen.porPrestador.map((p) => ({
        prestador: p.prestador,
        promedio: p.promedio,
        total: p.total,
        semaforo: p.semaforo,
      })),
    };
  }
}
