// Bitácora de auditoría: registro inmutable de las acciones que el gestor
// ejecuta sobre los expedientes. Es evidencia de quién hizo qué y cuándo.
//
// ZDR: la bitácora guarda SOLO metadatos de la acción (folio, actor, estado),
// nunca datos personales del ciudadano (correo, teléfono, nombres de niños).

export const ACCIONES = ["AVANZAR_ESTADO", "ELIMINAR"] as const;
export type Accion = (typeof ACCIONES)[number];

export interface EventoBitacora {
  readonly id: string;
  readonly actor: string; // usuario gestor que ejecutó la acción
  readonly accion: Accion;
  readonly folio: string; // expediente afectado
  readonly detalle: string; // contexto legible, ej. "En solicitud → Aprobado"
  readonly createdAt: Date;
}

// Lo que la capa HTTP entrega para registrar; id y fecha los pone el sistema.
export type NuevoEvento = Omit<EventoBitacora, "id" | "createdAt">;
