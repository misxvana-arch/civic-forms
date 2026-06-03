import { type Propuesta } from "../../domain/entities/propuesta.ts";

// Puerto de persistencia de las propuestas de co-creación.
export interface PropuestaRepository {
  guardar(propuesta: Propuesta): Promise<void>;
  // Listadas de más a menos apoyos (las más respaldadas primero).
  listar(): Promise<ReadonlyArray<Propuesta>>;
  // Suma un apoyo a la propuesta indicada. Devuelve la propuesta actualizada,
  // o null si no existe.
  apoyar(id: string): Promise<Propuesta | null>;
}
