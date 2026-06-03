import { z } from "zod";
import {
  CALIFICACION_MIN,
  CALIFICACION_MAX,
} from "../../../domain/entities/encuesta.ts";

// Validación de la encuesta en la frontera HTTP. El comentario es opcional y
// se acota a 500 caracteres para evitar abusos; nunca se registra en logs.
const escala1a5 = (campo: string) =>
  z.coerce
    .number()
    .int(`Selecciona del 1 al 5 en "${campo}".`)
    .min(CALIFICACION_MIN, `Selecciona del 1 al 5 en "${campo}".`)
    .max(CALIFICACION_MAX, `Selecciona del 1 al 5 en "${campo}".`);

export const enviarEncuestaSchema = z.object({
  // Tercero prestador evaluado. Texto libre acotado (viene de un desplegable).
  prestador: z
    .string()
    .trim()
    .min(1, "Indica qué taller/prestador evalúas.")
    .max(120),
  escuela: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((v) => v ?? ""),
  calificacion: escala1a5("satisfacción general"),
  puntualidad: escala1a5("puntualidad y cumplimiento"),
  calidadTaller: escala1a5("calidad del taller"),
  trato: escala1a5("trato a la comunidad"),
  recomendaria: z.boolean({
    errorMap: () => ({ message: "Indica si recomendarías el programa." }),
  }),
  comentario: z
    .string()
    .trim()
    .max(500, "El comentario es demasiado largo (máx. 500).")
    .optional()
    .transform((v) => v ?? ""),
});

export type EnviarEncuestaDTO = z.infer<typeof enviarEncuestaSchema>;
