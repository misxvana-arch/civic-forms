import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

// Esquema PostgreSQL (producción). Refleja exactamente el de SQLite (dev):
// los mismos nombres de columna, para que el dominio no note el cambio de
// motor. Las marcas de tiempo se guardan como timestamptz (Date en JS).

export const inscripciones = pgTable("inscripciones", {
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
  consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const bitacora = pgTable("bitacora", {
  id: text("id").primaryKey(),
  actor: text("actor").notNull(),
  accion: text("accion").notNull(),
  folio: text("folio").notNull(),
  detalle: text("detalle").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const encuestas = pgTable("encuestas", {
  id: text("id").primaryKey(),
  prestador: text("prestador").notNull().default(""),
  escuela: text("escuela").notNull().default(""),
  calificacion: integer("calificacion").notNull(),
  puntualidad: integer("puntualidad"),
  calidadTaller: integer("calidad_taller"),
  trato: integer("trato"),
  recomendaria: boolean("recomendaria").notNull(),
  comentario: text("comentario").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

// Co-creación (Gobierno Abierto): propuestas de contenido del público y los
// apoyos (votos) que reciben.
export const propuestas = pgTable("propuestas", {
  id: text("id").primaryKey(),
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion").notNull(),
  escuela: text("escuela").notNull().default(""),
  apoyos: integer("apoyos").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export type InscripcionRow = typeof inscripciones.$inferSelect;
export type EventoBitacoraRow = typeof bitacora.$inferSelect;
export type EncuestaRow = typeof encuestas.$inferSelect;
export type PropuestaRow = typeof propuestas.$inferSelect;
