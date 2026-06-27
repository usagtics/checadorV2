import { Router } from "express";
import { getAsistenciaTeams } from "../controllers/teams.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js"; 
import { teamsAttendanceSchema } from "../schemas/teams.schema.js";

const router = Router();

router.post(
  "/teams/asistencia",
  validateSchema(teamsAttendanceSchema),
  getAsistenciaTeams
);

export default router;