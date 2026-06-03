// Propuesta de contenido para el programa "Mi Barrio, Mi Patrimonio".
// Mecanismo de CO-CREACIÓN (Gobierno Abierto): cualquier persona de la
// comunidad escolar puede proponer temas/talleres y la comunidad los "apoya"
// (vota). Es anónima: no guarda datos personales del autor.

export interface DatosPropuesta {
  readonly titulo: string;
  readonly descripcion: string;
  readonly escuela: string; // opcional ("" si no se indica)
}

export interface Propuesta extends DatosPropuesta {
  readonly id: string;
  readonly apoyos: number; // cuántos apoyos (votos) acumula
  readonly createdAt: Date;
}
