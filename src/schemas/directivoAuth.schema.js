import { z } from 'zod';

export const directivoRegisterSchema = z.object({
    username: z.string({ required_error: "El nombre de usuario es requerido" }),
    email: z.string({ required_error: "El email es requerido" }).email({ message: "Email inválido" }),
    password: z.string({ required_error: "La contraseña es requerida" }).min(6, { message: "Mínimo 6 caracteres" }),
    
    carrera: z.string({ required_error: "La carrera es requerida" }),
    
    role: z.string({ required_error: "El rango/rol es requerido" })
});

export const directivoLoginSchema = z.object({
    email: z.string({ required_error: "El email es requerido" }).email({ message: "Email inválido" }),
    password: z.string({ required_error: "La contraseña es requerida" })
});