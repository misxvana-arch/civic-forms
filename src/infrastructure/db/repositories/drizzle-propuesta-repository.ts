import { desc, eq, sql } from "drizzle-orm";
import { db } from "../client.ts";
import { propuestas, type PropuestaRow } from "../schema.ts";
import { type Propuesta } from "../../../domain/entities/propuesta.ts";
import { type PropuestaRepository } from "../../../application/ports/propuesta-repository.ts";

function aDominio(row: PropuestaRow): Propuesta {
  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion,
    escuela: row.escuela,
    apoyos: row.apoyos,
    createdAt: row.createdAt,
  };
}

export class DrizzlePropuestaRepository implements PropuestaRepository {
  async guardar(p: Propuesta): Promise<void> {
    db.insert(propuestas)
      .values({
        id: p.id,
        titulo: p.titulo,
        descripcion: p.descripcion,
        escuela: p.escuela,
        apoyos: p.apoyos,
        createdAt: p.createdAt,
      })
      .run();
  }

  async listar(): Promise<ReadonlyArray<Propuesta>> {
    const rows = db
      .select()
      .from(propuestas)
      .orderBy(desc(propuestas.apoyos), desc(propuestas.createdAt))
      .all();
    return rows.map(aDominio);
  }

  async apoyar(id: string): Promise<Propuesta | null> {
    db.update(propuestas)
      .set({ apoyos: sql`${propuestas.apoyos} + 1` })
      .where(eq(propuestas.id, id))
      .run();
    const row = db
      .select()
      .from(propuestas)
      .where(eq(propuestas.id, id))
      .get();
    return row ? aDominio(row) : null;
  }
}
