// Normalización de nombres de escuela para cruzar el catálogo del DENUE con
// las inscripciones. Vive aparte porque la usan varios casos de uso (mapa y
// catálogo de inscripción) y debe ser EXACTAMENTE la misma en ambos: si
// divergiera, una escuela cruzaría en el mapa pero no en el formulario.

// Palabras genéricas que NO distinguen una escuela de otra: sin quitarlas,
// "Escuela Primaria Benito Juárez" no cruzaría con "Benito Juárez".
const RUIDO =
  /\b(escuela|primaria|esc|prim|colegio|instituto|plantel|particular|oficial|federal|estatal|centro|escolar)\b/g;

export function normalizarNombreEscuela(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita los acentos (diacríticos combinados)
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .replace(RUIDO, " ")
    .replace(/\s+/g, " ")
    .trim();
}
