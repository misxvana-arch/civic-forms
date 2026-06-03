import { z } from "zod";
import { BARRIO_NOMBRES } from "../../../application/geo/barrios.ts";

// Validación estricta de entrada en la frontera HTTP. Reproduce las reglas
// del formulario, pero del lado del servidor: el cliente NO es de fiar.
// `consent` debe ser literalmente true — sin aceptación, no hay trámite.
export const crearInscripcionSchema = z.object({
  nombre: z.string().trim().min(1, "Ingresa el nombre de la institución."),
  sostenimiento: z.enum(["Pública", "Privada"], {
    errorMap: () => ({ message: "Selecciona el tipo de sostenimiento." }),
  }),
  cct: z
    .string()
    .trim()
    .min(8, "CCT obligatorio (mín. 8 caracteres).")
    .max(12)
    .transform((v) => v.toUpperCase()),
  domicilio: z.string().trim().min(1, "Ingresa el domicilio."),
  sector: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v !== "" ? v : "Sin especificar")),
  grados: z.string().trim().min(1, "Indica al menos un grado."),
  enlace: z.string().trim().min(1, "Ingresa el nombre del enlace."),
  cargo: z
    .string()
    .trim()
    .optional()
    .transform((v) => v ?? ""),
  correo: z.string().trim().email("Correo electrónico no válido."),
  telefono: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Teléfono a 10 dígitos."),
  ninos: z.coerce
    .number()
    .int("Número entre 1 y 40.")
    .min(1, "Número entre 1 y 40.")
    .max(40, "Límite de 40 por grupo."),
  fecha: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v !== "" ? v : null)),
  hora: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora en formato HH:MM (24 h).")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v !== "" ? v : null)),
  // Barrio: se acepta solo si es uno de los reconocidos; si no, queda en null.
  barrio: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && BARRIO_NOMBRES.includes(v) ? v : null)),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar el aviso de privacidad." }),
  }),
});

export type CrearInscripcionDTO = z.infer<typeof crearInscripcionSchema>;
