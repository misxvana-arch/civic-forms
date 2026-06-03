import { type Encuesta } from "../../domain/entities/encuesta.ts";

// Puerto de persistencia de la encuesta de satisfacción.
export interface EncuestaRepository {
  guardar(encuesta: Encuesta): Promise<void>;
  listar(): Promise<ReadonlyArray<Encuesta>>;
}
