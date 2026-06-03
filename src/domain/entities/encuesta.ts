// Encuesta de satisfacción de las jornadas "Mi Barrio, Mi Patrimonio".
// La responde el público participante (sin sesión); el gestor solo ve el
// resumen agregado. No se recaban datos personales: es anónima por diseño.

export const CALIFICACION_MIN = 1;
export const CALIFICACION_MAX = 5;

export interface DatosEncuesta {
  readonly calificacion: number; // satisfacción general, 1 a 5
  readonly recomendaria: boolean; // ¿recomendaría el programa?
  readonly comentario: string; // texto libre opcional ("" si vacío)
}

export interface Encuesta extends DatosEncuesta {
  readonly id: string;
  readonly createdAt: Date;
}

// Invariante de dominio: la calificación debe caer dentro de la escala.
// Se valida también en el borde HTTP (Zod), pero el dominio no confía en eso.
export function calificacionValida(n: number): boolean {
  return Number.isInteger(n) && n >= CALIFICACION_MIN && n <= CALIFICACION_MAX;
}
