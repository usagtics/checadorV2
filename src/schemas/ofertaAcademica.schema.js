import { z } from 'zod';

export const crearOfertaSchema = z.object({
    docente: z.string({ required_error: 'El ID del docente es requerido' }),
    materia: z.string({ required_error: 'El ID de la materia es requerido' }),
    grupo: z.string({ required_error: 'El ID del grupo es requerido' }),
    periodo: z.string().optional(),
    horarios: z.array(
        z.object({
            diaSemana: z.enum(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']),
            horaInicio: z.string(), // Ej: "09:00"
            horaFin: z.string()     // Ej: "10:00"
        })
    ).min(1, "Debe tener al menos un horario asignado")
});