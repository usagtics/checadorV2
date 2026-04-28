import { z } from "zod";

export const createPlantelSchema = z.object({
  nombre: z.string({
    required_error: "El nombre del plantel es requerido",
  }).min(3, { message: "El nombre debe tener al menos 3 caracteres" }),

  direccion: z.string({
    required_error: "La dirección del plantel es requerida",
  }).min(5, { message: "La dirección debe tener al menos 5 caracteres" }),

  // 👇 VALIDACIÓN DE ARRAY DE IPs
  ipsPermitidas: z.array(z.string(), {
    required_error: "Se requiere la lista de IPs",
  }).nonempty({ message: "Debes registrar al menos una IP autorizada" }),

  activo: z.boolean().optional(),
});

export const updatePlantelSchema = z.object({
  nombre: z.string().min(3).optional(),
  direccion: z.string().min(5).optional(),
  ipsPermitidas: z.array(z.string()).nonempty().optional(),
  activo: z.boolean().optional(),
});