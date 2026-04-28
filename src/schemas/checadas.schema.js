import { z } from "zod";

export const createChecadaSchema = z.object({
  empleadoId: z.string({
    required_error: "El ID del empleado es requerido",
  }),
  plantelId: z.string({
    required_error: "El ID del plantel es requerido",
  }),
  // Eliminamos 'tipo', 'fechaHora', 'latitud' y 'longitud'
  // porque el Backend ahora se encarga de calcular todo eso.
});