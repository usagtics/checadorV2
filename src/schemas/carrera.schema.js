import { z } from 'zod';

export const createCarreraSchema = z.object({
    clave: z.string({
        required_error: 'La clave de la carrera es requerida',
    }).min(3, {
        message: 'La clave debe tener al menos 3 caracteres',
    }),
    nombre: z.string({
        required_error: 'El nombre de la carrera es requerido',
    }),
    campus: z.string({
        required_error: 'El campus es requerido',
    }),
    activa: z.boolean().optional()
});