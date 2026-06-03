import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Tabla única del MVP: un expediente de inscripción por fila.
// La restricción UNIQUE en `cct` es la última línea de defensa contra
// inscripciones duplicadas, incluso si dos peticiones corren a la vez.
export const inscripciones = sqliteTable("inscripciones", {
  id: text("id").primaryKey(),
  folio: text("folio").notNull().unique(),
  nombre: text("nombre").notNull(),
  sostenimiento: text("sostenimiento").notNull(),
  cct: text("cct").notNull().unique(),
  domicilio: text("domicilio").notNull(),
  sector: text("sector").notNull(),
  grados: text("grados").notNull(),
  enlace: text("enlace").notNull(),
  cargo: text("cargo").notNull().default(""),
  correo: text("correo").notNull(),
  telefono: text("telefono").notNull(),
  ninos: integer("ninos").notNull(),
  fecha: text("fecha"),
  hora: text("hora"),
  barrio: text("barrio"),
  estado: text("estado").notNull(),
  consentAt: integer("consent_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type InscripcionRow = typeof inscripciones.$inferSelect;
export type NuevaInscripcionRow = typeof inscripciones.$inferInsert;

// Bitácora de auditoría: append-only. Cada fila es una acción del gestor.
// No tiene UPDATE ni DELETE en el repositorio: el historial no se reescribe.
export const bitacora = sqliteTable("bitacora", {
  id: text("id").primaryKey(),
  actor: text("actor").notNull(),
  accion: text("accion").notNull(),
  folio: text("folio").notNull(),
  detalle: text("detalle").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type EventoBitacoraRow = typeof bitacora.$inferSelect;

// Encuesta de satisfacción: respuestas anónimas del público participante.
// No hay llave foránea a una persona: por diseño no guarda datos personales.
export const encuestas = sqliteTable("encuestas", {
  id: text("id").primaryKey(),
  // Nullable a propósito: así `db:push` las agrega a una tabla ya existente
  // sin pedir confirmación interactiva (clave para el deploy automático).
  prestador: text("prestador"),
  escuela: text("escuela"),
  calificacion: integer("calificacion").notNull(),
  puntualidad: integer("puntualidad"),
  calidadTaller: integer("calidad_taller"),
  trato: integer("trato"),
  recomendaria: integer("recomendaria", { mode: "boolean" }).notNull(),
  comentario: text("comentario").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type EncuestaRow = typeof encuestas.$inferSelect;

// Co-creación (Gobierno Abierto): propuestas de contenido del público y los
// apoyos (votos) que reciben.
export const propuestas = sqliteTable("propuestas", {
  id: text("id").primaryKey(),
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion").notNull(),
  escuela: text("escuela").notNull().default(""),
  apoyos: integer("apoyos").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type PropuestaRow = typeof propuestas.$inferSelect;
