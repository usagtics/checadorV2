// empleados.schema.js

import { z } from "zod";

// Schema para crear un empleado
export const createEmployeeSchema = z.object({
  name: z.string({
    required_error: "Name is required"
  }).min(3, { message: "Name must be at least 3 characters long" }),

  email: z.string({
    required_error: "Email is required"
  }).email("Invalid email address"),

  role: z.enum(["admin", "employee"], {
    errorMap: () => ({ message: "Role must be 'admin' or 'employee'" })
  }),

  photo: z.string().url("Invalid URL for photo").optional().nullable(),

  tipoHorario: z.string({
    required_error: "Tipo de horario es requerido"
  }).min(1, { message: "El tipo de horario no puede estar vacío" })
});

// Schema para actualizar un empleado
export const updateEmployeeSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "employee"]).optional(),
  photo: z.string().url().optional().nullable(),
  tipoHorario: z.string().min(1).optional()
});
