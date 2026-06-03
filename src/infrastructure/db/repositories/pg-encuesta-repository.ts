import { desc } from "drizzle-orm";
import { pgDb } from "../pg-client.ts";
import { encuestas, type EncuestaRow } from "../schema.pg.ts";
import { type Encuesta } from "../../../domain/entities/encuesta.ts";
import { type EncuestaRepository } from "../../../application/ports/encuesta-repository.ts";

function aDominio(row: EncuestaRow): Encuesta {
  return {
    id: row.id,
    prestador: row.prestador ?? "",
    escuela: row.escuela ?? "",
    calificacion: row.calificacion,
    puntualidad: row.puntualidad ?? row.calificacion,
    calidadTaller: row.calidadTaller ?? row.calificacion,
    trato: row.trato ?? row.calificacion,
    recomendaria: row.recomendaria,
    comentario: row.comentario,
    createdAt: row.createdAt,
  };
}

export class PgEncuestaRepository implements EncuestaRepository {
  async guardar(e: Encuesta): Promise<void> {
    await pgDb.insert(encuestas).values({
      id: e.id,
      prestador: e.prestador,
      escuela: e.escuela,
      calificacion: e.calificacion,
      puntualidad: e.puntualidad,
      calidadTaller: e.calidadTaller,
      trato: e.trato,
      recomendaria: e.recomendaria,
      comentario: e.comentario,
      createdAt: e.createdAt,
    });
  }

  async listar(): Promise<ReadonlyArray<Encuesta>> {
    const rows = await pgDb
      .select()
      .from(encuestas)
      .orderBy(desc(encuestas.createdAt));
    return rows.map(aDominio);
  }
}
