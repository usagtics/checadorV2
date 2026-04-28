import { z } from "zod";

// Definición de la validación de los datos de tipo horario
export const createTipoHorarioSchema = z.object({
  nombre: z.string({
    required_error: "El nombre es requerido",
  }).min(3, { message: "El nombre debe tener al menos 3 caracteres" }),

  descripcion: z.string().max(200, {
    message: "La descripción no puede superar los 200 caracteres",
  }).optional(),

  hora_entrada: z.string({
    required_error: "La hora de entrada es requerida",
  }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Formato de hora de entrada inválido. Usa HH:mm (24h)",
  }),

  hora_salida: z.string({
    required_error: "La hora de salida es requerida",
  }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Formato de hora de salida inválido. Usa HH:mm (24h)",
  }),

  tolerancia_min: z.number().int().min(0).optional(),

  fechaCreacion: z.coerce.date().default(() => new Date()).optional(),
});

export const updateTipoHorarioSchema = createTipoHorarioSchema.partial();
