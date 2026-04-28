import { z } from "zod";

export const createEmployeeSchema = z.object({
  name: z.string({
    required_error: "Name is required",
  }).min(3, { message: "Name must be at least 3 characters long" }),

  email: z.string({
    required_error: "Email is required",
  }).email("Invalid email address"),

  role: z.enum(["admin", "employee"], {
    errorMap: () => ({ message: "Role must be 'admin' or 'employee'" }),
  }),

  photo: z.string().url("Invalid URL for photo").optional().nullable(),

  tipoHorario: z.string().optional().nullable(),

  // 🔹 Nuevo: ID del plantel
  plantel: z.string({
    required_error: "Plantel is required",
  }).optional().nullable(),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }).optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(["admin", "employee"]).optional(),
  photo: z.string().url("Invalid URL for photo").optional().nullable(),
  tipoHorario: z.string().optional().nullable(),
  
  // 🔹 Nuevo: también permitir actualizar el plantel
  plantel: z.string().optional().nullable(),
});
