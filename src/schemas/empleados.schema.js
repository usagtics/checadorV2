// empleados.schema.js

import { z } from "zod";

// Esquema para la creación de un empleado
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
});

// Esquema para la actualización de un empleado
export const updateEmployeeSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }).optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(["admin", "employee"]).optional(),
  photo: z.string().url("Invalid URL for photo").optional().nullable(),
});
