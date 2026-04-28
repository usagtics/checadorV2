import { z } from 'zod';

export const crearMateriaSchema = z.object({
    nombre: z.string({ required_error: 'El nombre de la materia es requerido' }),
    clave: z.string({ required_error: 'La clave es requerida' })
});