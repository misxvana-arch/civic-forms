import { type Inscripcion } from "../../domain/entities/inscripcion.ts";

// Puerto: la aplicación declara QUÉ necesita de la persistencia.
// Drizzle/SQLite/Postgres deciden CÓMO, sin que el dominio los conozca.
export interface InscripcionRepository {
  guardar(inscripcion: Inscripcion): Promise<void>;
  buscarPorId(id: string): Promise<Inscripcion | null>;
  existePorCct(cct: string): Promise<boolean>;
  contar(): Promise<number>;
  // Búsqueda opcional por texto (nombre, CCT, sector). Sin filtro: todas.
  listar(filtro?: string): Promise<ReadonlyArray<Inscripcion>>;
  eliminar(id: string): Promise<boolean>;
  actualizarEstado(id: string, estado: Inscripcion["estado"]): Promise<void>;
}
