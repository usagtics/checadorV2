import { z } from 'zod';

export const crearGrupoSchema = z.object({
    nombre: z.string({ required_error: 'El nombre del grupo es requerido' })
});