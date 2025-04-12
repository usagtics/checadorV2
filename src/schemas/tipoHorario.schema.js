import { z } from "zod";


export const createTipoHorarioSchema = z.object({
  nombre: z.string({
    required_error: "Nombre es obligatorio"
  }).min(3, { message: "El nombre debe tener al menos 3 caracteres" }),

  descripcion: z.string({
    required_error: "Descripción es obligatoria"
  }).min(5, { message: "La descripción debe tener al menos 5 caracteres" }),
});


export const updateTipoHorarioSchema = z.object({
  nombre: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }).optional(),
  descripcion: z.string().min(5, { message: "La descripción debe tener al menos 5 caracteres" }).optional(),
});
