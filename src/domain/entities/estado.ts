import { EstadoFinalError } from "../errors/domain-error.ts";

// Máquina de estados del expediente. El orden ES la regla: un expediente
// solo avanza hacia adelante, un paso a la vez. Centralizarlo aquí evita
// que un controlador o el frontend salten o retrocedan estados.
export const ESTADOS = [
  "En solicitud",
  "Aprobado",
  "Programado",
  "Concluido",
] as const;

export type Estado = (typeof ESTADOS)[number];

export const ESTADO_INICIAL: Estado = ESTADOS[0];

export function esEstado(valor: string): valor is Estado {
  return (ESTADOS as ReadonlyArray<string>).includes(valor);
}

export function esFinal(estado: Estado): boolean {
  return estado === ESTADOS[ESTADOS.length - 1];
}

export function siguienteEstado(actual: Estado): Estado {
  const pos = ESTADOS.indexOf(actual);
  if (pos < 0 || pos >= ESTADOS.length - 1) {
    throw new EstadoFinalError();
  }
  // Seguro: pos+1 está dentro de rango por la guarda anterior.
  return ESTADOS[pos + 1]!;
}
