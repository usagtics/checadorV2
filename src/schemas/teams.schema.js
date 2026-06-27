import { z } from "zod";

export const teamsAttendanceSchema = z.object({
  userId: z.string({
    required_error: "El ID del usuario de Microsoft es obligatorio",
  }),
  meetingId: z.string({
    required_error: "El ID de la reunión es obligatorio",
  }),
  docenteId: z.string({
    required_error: "El ID del docente en el sistema es obligatorio",
  }),
});