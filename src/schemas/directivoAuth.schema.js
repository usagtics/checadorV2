import { z } from 'zod';

export const directivoRegisterSchema = z.object({
    username: z.string({ required_error: "El nombre de usuario es requerido" }),
    email: z.string({ required_error: "El email es requerido" }).email({ message: "Email inválido" }),
    password: z.string({ required_error: "La contraseña es requerida" }).min(6, { message: "Mínimo 6 caracteres" }),
    
    // 👇 EL CAMBIO ESTÁ AQUÍ (Plural y tipo Array)
    carreras: z.array(z.string(), { 
        required_error: "Las carreras son requeridas",
        invalid_type_error: "Las carreras deben enviarse en formato de lista"
    }).min(1, { message: "Debes asignar al menos un área" }),
    
    role: z.string({ required_error: "El rango/rol es requerido" })
});

export const directivoLoginSchema = z.object({
    email: z.string({ required_error: "El email es requerido" }).email({ message: "Email inválido" }),
    password: z.string({ required_error: "La contraseña es requerida" })
});