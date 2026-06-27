import { z } from 'zod';

export const crearPeriodoSchema = z.object({
    nombre: z.string({ 
        required_error: 'El nombre del periodo es requerido' 
    }),
    fechaInicio: z.string().optional(),
    fechaFin: z.string().optional(),
    activo: z.boolean().optional()
});