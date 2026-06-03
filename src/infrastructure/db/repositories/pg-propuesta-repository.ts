import { desc, eq, sql } from "drizzle-orm";
import { pgDb } from "../pg-client.ts";
import { propuestas, type PropuestaRow } from "../schema.pg.ts";
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

export class PgPropuestaRepository implements PropuestaRepository {
  async guardar(p: Propuesta): Promise<void> {
    await pgDb.insert(propuestas).values({
      id: p.id,
      titulo: p.titulo,
      descripcion: p.descripcion,
      escuela: p.escuela,
      apoyos: p.apoyos,
      createdAt: p.createdAt,
    });
  }

  async listar(): Promise<ReadonlyArray<Propuesta>> {
    const rows = await pgDb
      .select()
      .from(propuestas)
      .orderBy(desc(propuestas.apoyos), desc(propuestas.createdAt));
    return rows.map(aDominio);
  }

  async apoyar(id: string): Promise<Propuesta | null> {
    const rows = await pgDb
      .update(propuestas)
      .set({ apoyos: sql`${propuestas.apoyos} + 1` })
      .where(eq(propuestas.id, id))
      .returning();
    const row = rows[0];
    return row ? aDominio(row) : null;
  }
}
