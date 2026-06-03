import { env } from "../../config/env.ts";
import { type InscripcionRepository } from "../../application/ports/inscripcion-repository.ts";
import { type BitacoraRepository } from "../../application/ports/bitacora-repository.ts";
import { type EncuestaRepository } from "../../application/ports/encuesta-repository.ts";
import { type PropuestaRepository } from "../../application/ports/propuesta-repository.ts";

export interface Repositorios {
  readonly inscripcion: InscripcionRepository;
  readonly bitacora: BitacoraRepository;
  readonly encuesta: EncuestaRepository;
  readonly propuesta: PropuestaRepository;
}

// Selección del motor de base de datos en un solo lugar. Usa import dinámico
// para que SOLO se cargue el driver elegido: en dev nunca se conecta Postgres
// y en prod nunca se carga el binario nativo de SQLite.
export async function crearRepositorios(): Promise<Repositorios> {
  if (env.DB_DRIVER === "postgres") {
    const [inscMod, bitaMod, encMod, propMod] = await Promise.all([
      import("./repositories/pg-inscripcion-repository.ts"),
      import("./repositories/pg-bitacora-repository.ts"),
      import("./repositories/pg-encuesta-repository.ts"),
      import("./repositories/pg-propuesta-repository.ts"),
    ]);
    return {
      inscripcion: new inscMod.PgInscripcionRepository(),
      bitacora: new bitaMod.PgBitacoraRepository(),
      encuesta: new encMod.PgEncuestaRepository(),
      propuesta: new propMod.PgPropuestaRepository(),
    };
  }

  const [inscMod, bitaMod, encMod, propMod] = await Promise.all([
    import("./repositories/drizzle-inscripcion-repository.ts"),
    import("./repositories/drizzle-bitacora-repository.ts"),
    import("./repositories/drizzle-encuesta-repository.ts"),
    import("./repositories/drizzle-propuesta-repository.ts"),
  ]);
  return {
    inscripcion: new inscMod.DrizzleInscripcionRepository(),
    bitacora: new bitaMod.DrizzleBitacoraRepository(),
    encuesta: new encMod.DrizzleEncuestaRepository(),
    propuesta: new propMod.DrizzlePropuestaRepository(),
  };
}
