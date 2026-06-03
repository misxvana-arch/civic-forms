import { z } from "zod";
import {
  CALIFICACION_MIN,
  CALIFICACION_MAX,
} from "../../../domain/entities/encuesta.ts";

// Validación de la encuesta en la frontera HTTP. El comentario es opcional y
// se acota a 500 caracteres para evitar abusos; nunca se registra en logs.
export const enviarEncuestaSchema = z.object({
  calificacion: z.coerce
    .number()
    .int("Selecciona una calificación del 1 al 5.")
    .min(CALIFICACION_MIN, "Selecciona una calificación del 1 al 5.")
    .max(CALIFICACION_MAX, "Selecciona una calificación del 1 al 5."),
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
