import { eq, or, like, sql, desc } from "drizzle-orm";
import { pgDb } from "../pg-client.ts";
import { inscripciones, type InscripcionRow } from "../schema.pg.ts";
import {
  type Inscripcion,
  type Sostenimiento,
} from "../../../domain/entities/inscripcion.ts";
import { type Estado } from "../../../domain/entities/estado.ts";
import { type InscripcionRepository } from "../../../application/ports/inscripcion-repository.ts";

// Versión PostgreSQL del repositorio (async). Misma lógica que la de SQLite,
// pero con el driver postgres-js: las consultas se resuelven con `await` y
// devuelven arreglos en vez de los .get()/.all()/.run() síncronos de SQLite.
function aDominio(row: InscripcionRow): Inscripcion {
  return {
    id: row.id,
    folio: row.folio,
    nombre: row.nombre,
    sostenimiento: row.sostenimiento as Sostenimiento,
    cct: row.cct,
    domicilio: row.domicilio,
    sector: row.sector,
    grados: row.grados,
    enlace: row.enlace,
    cargo: row.cargo,
    correo: row.correo,
    telefono: row.telefono,
    ninos: row.ninos,
    fecha: row.fecha,
    hora: row.hora,
    barrio: row.barrio,
    estado: row.estado as Estado,
    consentAt: row.consentAt,
    createdAt: row.createdAt,
  };
}

export class PgInscripcionRepository implements InscripcionRepository {
  async guardar(i: Inscripcion): Promise<void> {
    await pgDb.insert(inscripciones).values({
      id: i.id,
      folio: i.folio,
      nombre: i.nombre,
      sostenimiento: i.sostenimiento,
      cct: i.cct,
      domicilio: i.domicilio,
      sector: i.sector,
      grados: i.grados,
      enlace: i.enlace,
      cargo: i.cargo,
      correo: i.correo,
      telefono: i.telefono,
      ninos: i.ninos,
      fecha: i.fecha,
      hora: i.hora,
      barrio: i.barrio,
      estado: i.estado,
      consentAt: i.consentAt,
      createdAt: i.createdAt,
    });
  }

  async buscarPorId(id: string): Promise<Inscripcion | null> {
    const rows = await pgDb
      .select()
      .from(inscripciones)
      .where(eq(inscripciones.id, id))
      .limit(1);
    const row = rows[0];
    return row ? aDominio(row) : null;
  }

  async existePorCct(cct: string): Promise<boolean> {
    const rows = await pgDb
      .select({ id: inscripciones.id })
      .from(inscripciones)
      .where(eq(inscripciones.cct, cct))
      .limit(1);
    return rows.length > 0;
  }

  async contar(): Promise<number> {
    const rows = await pgDb
      .select({ n: sql<number>`count(*)::int` })
      .from(inscripciones);
    return rows[0]?.n ?? 0;
  }

  async listar(filtro?: string): Promise<ReadonlyArray<Inscripcion>> {
    const base = pgDb.select().from(inscripciones);
    const rows =
      filtro && filtro.trim() !== ""
        ? await base
            .where(
              or(
                like(inscripciones.nombre, `%${filtro}%`),
                like(inscripciones.cct, `%${filtro}%`),
                like(inscripciones.sector, `%${filtro}%`),
              ),
            )
            .orderBy(desc(inscripciones.createdAt))
        : await base.orderBy(desc(inscripciones.createdAt));
    return rows.map(aDominio);
  }

  async eliminar(id: string): Promise<boolean> {
    const res = await pgDb
      .delete(inscripciones)
      .where(eq(inscripciones.id, id))
      .returning({ id: inscripciones.id });
    return res.length > 0;
  }

  async actualizarEstado(id: string, estado: Estado): Promise<void> {
    await pgDb
      .update(inscripciones)
      .set({ estado })
      .where(eq(inscripciones.id, id));
  }
}
