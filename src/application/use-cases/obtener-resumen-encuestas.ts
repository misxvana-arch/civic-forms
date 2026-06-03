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

export interface ResumenEncuestas {
  readonly total: number;
  readonly promedio: number; // 0 si no hay respuestas
  readonly recomiendan: number; // cuántas marcaron "recomendaría"
  readonly porcentajeRecomienda: number; // 0-100
  // distribucion[k] = cuántas respuestas dieron la calificación (k+1)
  readonly distribucion: ReadonlyArray<number>;
  // Comentarios no vacíos, del más reciente al más antiguo.
  readonly comentarios: ReadonlyArray<ComentarioResumen>;
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
    }

    return {
      total,
      promedio: total === 0 ? 0 : Math.round((suma / total) * 10) / 10,
      recomiendan,
      porcentajeRecomienda: total === 0 ? 0 : Math.round((recomiendan / total) * 100),
      distribucion,
      comentarios,
    };
  }
}
