import { desc } from "drizzle-orm";
import { db } from "../client.ts";
import { encuestas, type EncuestaRow } from "../schema.ts";
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

export class DrizzleEncuestaRepository implements EncuestaRepository {
  async guardar(e: Encuesta): Promise<void> {
    db.insert(encuestas)
      .values({
        id: e.id,
        calificacion: e.calificacion,
        recomendaria: e.recomendaria,
        comentario: e.comentario,
        createdAt: e.createdAt,
      })
      .run();
  }

  async listar(): Promise<ReadonlyArray<Encuesta>> {
    const rows = db
      .select()
      .from(encuestas)
      .orderBy(desc(encuestas.createdAt))
      .all();
    return rows.map(aDominio);
  }
}
