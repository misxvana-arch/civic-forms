import { eq, or, like, sql, desc } from "drizzle-orm";
import { db } from "../client.ts";
import {
  inscripciones,
  type InscripcionRow,
} from "../schema.ts";
import {
  type Inscripcion,
  type Sostenimiento,
} from "../../../domain/entities/inscripcion.ts";
import { type Estado } from "../../../domain/entities/estado.ts";
import { type InscripcionRepository } from "../../../application/ports/inscripcion-repository.ts";

// Frontera de confianza: lo que escribimos siempre fue validado, así que
// al leer casteamos los textos a sus uniones de dominio de forma controlada.
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

export class DrizzleInscripcionRepository implements InscripcionRepository {
  async guardar(i: Inscripcion): Promise<void> {
    db.insert(inscripciones)
      .values({
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
      })
      .run();
  }

  async buscarPorId(id: string): Promise<Inscripcion | null> {
    const row = db
      .select()
      .from(inscripciones)
      .where(eq(inscripciones.id, id))
      .get();
    return row ? aDominio(row) : null;
  }

  async existePorCct(cct: string): Promise<boolean> {
    const row = db
      .select({ id: inscripciones.id })
      .from(inscripciones)
      .where(eq(inscripciones.cct, cct))
      .get();
    return row !== undefined;
  }

  async contar(): Promise<number> {
    const row = db
      .select({ n: sql<number>`count(*)` })
      .from(inscripciones)
      .get();
    return row?.n ?? 0;
  }

  async listar(filtro?: string): Promise<ReadonlyArray<Inscripcion>> {
    const base = db.select().from(inscripciones);
    const rows =
      filtro && filtro.trim() !== ""
        ? base
            .where(
              or(
                like(inscripciones.nombre, `%${filtro}%`),
                like(inscripciones.cct, `%${filtro}%`),
                like(inscripciones.sector, `%${filtro}%`),
              ),
            )
            .orderBy(desc(inscripciones.createdAt))
            .all()
        : base.orderBy(desc(inscripciones.createdAt)).all();
    return rows.map(aDominio);
  }

  async eliminar(id: string): Promise<boolean> {
    const res = db
      .delete(inscripciones)
      .where(eq(inscripciones.id, id))
      .run();
    return res.changes > 0;
  }

  async actualizarEstado(id: string, estado: Estado): Promise<void> {
    db.update(inscripciones)
      .set({ estado })
      .where(eq(inscripciones.id, id))
      .run();
  }
}
