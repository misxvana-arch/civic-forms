import { z } from "zod";

// Validación de una propuesta de co-creación en la frontera HTTP.
// Anónima: no se piden datos personales del autor.
export const crearPropuestaSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(4, "El título es muy corto.")
    .max(120, "El título es demasiado largo (máx. 120)."),
  descripcion: z
    .string()
    .trim()
    .min(10, "Describe un poco más tu propuesta.")
    .max(800, "La descripción es demasiado larga (máx. 800)."),
  escuela: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((v) => v ?? ""),
});

export type CrearPropuestaDTO = z.infer<typeof crearPropuestaSchema>;
