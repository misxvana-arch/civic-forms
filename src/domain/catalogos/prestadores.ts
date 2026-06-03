// Catálogo de TERCEROS PRESTADORES de los talleres del programa
// "Mi Barrio, Mi Patrimonio". La encuesta de satisfacción evalúa el desempeño
// de estos prestadores; el panel agrupa los resultados por cada uno para
// sustentar decisiones de requisición/contratación.
//
// ⚠️ EDITA esta lista con los proveedores realmente contratados por la
// gerencia. Los nombres son la llave de agrupación, así que escríbelos igual
// que en el contrato.
export const PRESTADORES: ReadonlyArray<string> = [
  "Colectivo Patrimonio Vivo",
  "Talleres Culturales del Centro",
  "Fundación Educa Puebla",
];

// Opción para quien respondió sin saber qué tercero impartió el taller.
export const PRESTADOR_OTRO = "Otro / No estoy seguro";

// Lista completa que ve el público en el desplegable (incluye la opción "Otro").
export const PRESTADORES_OPCIONES: ReadonlyArray<string> = [
  ...PRESTADORES,
  PRESTADOR_OTRO,
];
