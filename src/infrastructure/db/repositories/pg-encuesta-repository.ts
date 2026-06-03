import { desc } from "drizzle-orm";
import { pgDb } from "../pg-client.ts";
import { encuestas, type EncuestaRow } from "../schema.pg.ts";
import { type Encuesta } from "../../../domain/entities/encuesta.ts";
import { type EncuestaRepository } from "../../../application/ports/encuesta-repository.ts";

function aDominio(row: EncuestaRow): Encuesta {
  return {
    id: row.id,
    calificacion: row.calificacion,
    recomendaria: row.recomendaria,
    comentario: row.comentario,
    createdAt: row.createdAt,
  };
}

export class PgEncuestaRepository implements EncuestaRepository {
  async guardar(e: Encuesta): Promise<void> {
    await pgDb.insert(encuestas).values({
      id: e.id,
      calificacion: e.calificacion,
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
