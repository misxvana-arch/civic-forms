import { randomUUID } from "node:crypto";
import { desc } from "drizzle-orm";
import { db } from "../client.ts";
import { bitacora, type EventoBitacoraRow } from "../schema.ts";
import {
  type Accion,
  type EventoBitacora,
  type NuevoEvento,
} from "../../../domain/entities/evento-bitacora.ts";
import { type BitacoraRepository } from "../../../application/ports/bitacora-repository.ts";

// La acción se guardó validada (solo la escribe el sistema), así que al leer
// casteamos el texto a su unión de dominio de forma controlada.
function aDominio(row: EventoBitacoraRow): EventoBitacora {
  return {
    id: row.id,
    actor: row.actor,
    accion: row.accion as Accion,
    folio: row.folio,
    detalle: row.detalle,
    createdAt: row.createdAt,
  };
}

export class DrizzleBitacoraRepository implements BitacoraRepository {
  async registrar(evento: NuevoEvento): Promise<EventoBitacora> {
    const completo: EventoBitacora = {
      ...evento,
      id: randomUUID(),
      createdAt: new Date(),
    };
    db.insert(bitacora)
      .values({
        id: completo.id,
        actor: completo.actor,
        accion: completo.accion,
        folio: completo.folio,
        detalle: completo.detalle,
        createdAt: completo.createdAt,
      })
      .run();
    return completo;
  }

  async listar(limite = 100): Promise<ReadonlyArray<EventoBitacora>> {
    const rows = db
      .select()
      .from(bitacora)
      .orderBy(desc(bitacora.createdAt))
      .limit(limite)
      .all();
    return rows.map(aDominio);
  }
}
