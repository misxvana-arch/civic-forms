// Encuesta de satisfacción de las jornadas "Mi Barrio, Mi Patrimonio".
// La responde el público participante (sin sesión); el gestor solo ve el
// resumen agregado. No se recaban datos personales: es anónima por diseño.
//
// Además de la satisfacción general, evalúa el DESEMPEÑO DEL TERCERO PRESTADOR
// que impartió el taller (3 dimensiones, escala 1–5), para que la gerencia
// pueda sustentar decisiones de requisición/contratación.

export const CALIFICACION_MIN = 1;
export const CALIFICACION_MAX = 5;

export interface DatosEncuesta {
  readonly prestador: string; // tercero evaluado (del catálogo)
  readonly escuela: string; // escuela donde se dio la jornada ("" si no se indica)
  readonly calificacion: number; // satisfacción general, 1 a 5
  // Dimensiones del desempeño del prestador (1 a 5):
  readonly puntualidad: number; // cumplió horarios y fechas
  readonly calidadTaller: number; // calidad y dominio del contenido
  readonly trato: number; // trato a la comunidad escolar
  readonly recomendaria: boolean; // ¿recomendaría el programa?
  readonly comentario: string; // texto libre opcional ("" si vacío)
}

export interface Encuesta extends DatosEncuesta {
  readonly id: string;
  readonly createdAt: Date;
}

// Invariante de dominio: toda calificación (general o por dimensión) debe caer
// dentro de la escala. Se valida también en el borde HTTP (Zod), pero el
// dominio no confía en eso.
export function calificacionValida(n: number): boolean {
  return Number.isInteger(n) && n >= CALIFICACION_MIN && n <= CALIFICACION_MAX;
}
