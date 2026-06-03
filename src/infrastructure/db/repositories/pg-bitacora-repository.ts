import { randomUUID } from "node:crypto";
import { desc } from "drizzle-orm";
import { pgDb } from "../pg-client.ts";
import { bitacora, type EventoBitacoraRow } from "../schema.pg.ts";
import {
  type Accion,
  type EventoBitacora,
  type NuevoEvento,
} from "../../../domain/entities/evento-bitacora.ts";
import { type BitacoraRepository } from "../../../application/ports/bitacora-repository.ts";

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

export class PgBitacoraRepository implements BitacoraRepository {
  async registrar(evento: NuevoEvento): Promise<EventoBitacora> {
    const completo: EventoBitacora = {
      ...evento,
      id: randomUUID(),
      createdAt: new Date(),
    };
    await pgDb.insert(bitacora).values({
      id: completo.id,
      actor: completo.actor,
      accion: completo.accion,
      folio: completo.folio,
      detalle: completo.detalle,
      createdAt: completo.createdAt,
    });
    return completo;
  }

  async listar(limite = 100): Promise<ReadonlyArray<EventoBitacora>> {
    const rows = await pgDb
      .select()
      .from(bitacora)
      .orderBy(desc(bitacora.createdAt))
      .limit(limite);
    return rows.map(aDominio);
  }
}
