import { z } from 'zod';

export const crearDocenteSchema = z.object({
    nombre: z.string({
        required_error: 'El nombre es requerido',
    }),
    apellidos: z.string({
        required_error: 'Los apellidos son requeridos',
    }),
    numeroEmpleado: z.string({
        required_error: 'El número de empleado es requerido',
    }),
    email: z.string({
        required_error: 'El email es requerido',
    }).email({
        message: 'Email no válido',
    }),
    pagoPorHora: z.number({
        required_error: 'El pago por hora es requerido',
        invalid_type_error: 'El pago por hora debe ser un número',
    }).positive({
        message: 'El pago por hora debe ser mayor a 0',
    }),
    // --- ADAPTACIÓN PARA TURNOS ---
    turno: z.enum(['Matutino', 'Vespertino', 'Mixto'], {
        errorMap: () => ({ message: 'Selecciona un turno válido (Matutino, Vespertino o Mixto)' }),
    }),
    tipoContrato: z.enum(['Base', 'Honorarios'], {
        errorMap: () => ({ message: 'Selecciona un tipo de contrato válido' }),
    }).optional(), // Lo dejamos opcional por si no quieres pedirlo siempre
});