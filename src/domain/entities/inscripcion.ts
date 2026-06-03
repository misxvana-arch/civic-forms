import { type Estado } from "./estado.ts";

export type Sostenimiento = "Pública" | "Privada";

// Datos que captura el ciudadano (sin metadatos del sistema).
// `cargo` y `fecha` son opcionales en el formulario original.
export interface DatosInscripcion {
  readonly nombre: string;
  readonly sostenimiento: Sostenimiento;
  readonly cct: string;
  readonly domicilio: string;
  readonly sector: string;
  readonly grados: string;
  readonly enlace: string;
  readonly cargo: string;
  readonly correo: string;
  readonly telefono: string;
  readonly ninos: number;
  readonly fecha: string | null;
  readonly hora: string | null;
  // Barrio del Centro Histórico detectado por la ubicación de la escuela.
  readonly barrio: string | null;
}

// El expediente completo, tal como vive en el sistema.
export interface Inscripcion extends DatosInscripcion {
  readonly id: string;
  readonly folio: string;
  readonly estado: Estado;
  // Sello de aceptación del aviso de privacidad: evidencia legal de que
  // hubo consentimiento. Es por qué guardamos un timestamp, no un booleano.
  readonly consentAt: Date;
  readonly createdAt: Date;
}

// Folio legible y trazable: MBMP-AÑO-CCT-CONSECUTIVO.
// El consecutivo lo provee el caso de uso (depende del conteo en BD).
export function generarFolio(cct: string, consecutivo: number): string {
  const anio = new Date().getFullYear();
  return `MBMP-${anio}-${cct}-${String(consecutivo).padStart(3, "0")}`;
}

export function normalizarCct(cct: string): string {
  return cct.trim().toUpperCase();
}
