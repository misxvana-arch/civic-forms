import {
  CALIFICACION_MIN,
  CALIFICACION_MAX,
} from "../../domain/entities/encuesta.ts";
import { type EncuestaRepository } from "../ports/encuesta-repository.ts";

export interface ComentarioResumen {
  readonly calificacion: number;
  readonly comentario: string;
  readonly createdAt: Date;
}

// Semáforo de desempeño del prestador, derivado del promedio general:
//   bien >= 4 · regular 3–3.9 · alerta < 3 (candidato a revisar contrato).
export type Semaforo = "bien" | "regular" | "alerta";

export interface PrestadorResumen {
  readonly prestador: string;
  readonly total: number;
  readonly promedio: number; // satisfacción general
  readonly promedioPuntualidad: number;
  readonly promedioCalidad: number;
  readonly promedioTrato: number;
  readonly porcentajeRecomienda: number; // 0-100
  readonly semaforo: Semaforo;
}

export interface ResumenEncuestas {
  readonly total: number;
  readonly promedio: number; // 0 si no hay respuestas
  readonly recomiendan: number; // cuántas marcaron "recomendaría"
  readonly porcentajeRecomienda: number; // 0-100
  // distribucion[k] = cuántas respuestas dieron la calificación (k+1)
  readonly distribucion: ReadonlyArray<number>;
  // Comentarios no vacíos, del más reciente al más antiguo.
  readonly comentarios: ReadonlyArray<ComentarioResumen>;
  // Desempeño agrupado por tercero prestador (insumo para requisiciones).
  // Ordenado del mejor al peor promedio.
  readonly porPrestador: ReadonlyArray<PrestadorResumen>;
}

function promedio(suma: number, n: number): number {
  return n === 0 ? 0 : Math.round((suma / n) * 10) / 10;
}

function semaforoDe(prom: number): Semaforo {
  if (prom >= 4) return "bien";
  if (prom >= 3) return "regular";
  return "alerta";
}

// Acumulador mutable interno por prestador.
interface Acum {
  total: number;
  suma: number;
  sumaPuntualidad: number;
  sumaCalidad: number;
  sumaTrato: number;
  recomiendan: number;
}

export class ObtenerResumenEncuestas {
  constructor(private readonly repo: EncuestaRepository) {}

  async execute(): Promise<ResumenEncuestas> {
    const todas = await this.repo.listar();
    const total = todas.length;

    const escala = CALIFICACION_MAX - CALIFICACION_MIN + 1;
    const distribucion = new Array<number>(escala).fill(0);
    let suma = 0;
    let recomiendan = 0;
    const comentarios: ComentarioResumen[] = [];
    const porPrestadorMap = new Map<string, Acum>();

    for (const e of todas) {
      suma += e.calificacion;
      if (e.recomendaria) recomiendan++;
      const idx = e.calificacion - CALIFICACION_MIN;
      if (idx >= 0 && idx < escala) distribucion[idx] = (distribucion[idx] ?? 0) + 1;
      if (e.comentario.trim() !== "") {
        comentarios.push({
          calificacion: e.calificacion,
          comentario: e.comentario,
          createdAt: e.createdAt,
        });
      }

      const clave = e.prestador.trim() === "" ? "Sin especificar" : e.prestador;
      const a =
        porPrestadorMap.get(clave) ??
        {
          total: 0,
          suma: 0,
          sumaPuntualidad: 0,
          sumaCalidad: 0,
          sumaTrato: 0,
          recomiendan: 0,
        };
      a.total++;
      a.suma += e.calificacion;
      a.sumaPuntualidad += e.puntualidad;
      a.sumaCalidad += e.calidadTaller;
      a.sumaTrato += e.trato;
      if (e.recomendaria) a.recomiendan++;
      porPrestadorMap.set(clave, a);
    }

    const porPrestador: PrestadorResumen[] = [...porPrestadorMap.entries()]
      .map(([prestador, a]) => {
        const prom = promedio(a.suma, a.total);
        return {
          prestador,
          total: a.total,
          promedio: prom,
          promedioPuntualidad: promedio(a.sumaPuntualidad, a.total),
          promedioCalidad: promedio(a.sumaCalidad, a.total),
          promedioTrato: promedio(a.sumaTrato, a.total),
          porcentajeRecomienda:
            a.total === 0 ? 0 : Math.round((a.recomiendan / a.total) * 100),
          semaforo: semaforoDe(prom),
        };
      })
      .sort((x, y) => y.promedio - x.promedio);

    return {
      total,
      promedio: promedio(suma, total),
      recomiendan,
      porcentajeRecomienda: total === 0 ? 0 : Math.round((recomiendan / total) * 100),
      distribucion,
      comentarios,
      porPrestador,
    };
  }
}
