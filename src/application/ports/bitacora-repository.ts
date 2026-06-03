import {
  type EventoBitacora,
  type NuevoEvento,
} from "../../domain/entities/evento-bitacora.ts";

// Puerto de persistencia de la bitácora. Solo se agrega y se lee:
// deliberadamente NO hay métodos para editar ni borrar eventos.
export interface BitacoraRepository {
  registrar(evento: NuevoEvento): Promise<EventoBitacora>;
  listar(limite?: number): Promise<ReadonlyArray<EventoBitacora>>;
}
