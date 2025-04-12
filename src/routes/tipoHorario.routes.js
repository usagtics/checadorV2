import { Router } from "express";
import {
  getAllTipoHorarios,
  createTipoHorario,
  updateTipoHorario,
  deleteTipoHorario
} from "../controllers/tipoHorario.controller.js"; 

const router = Router();


router.get("/tipo-horario", getAllTipoHorarios);

router.post("/tipo-horario", createTipoHorario); 


router.put("/tipo-horario/:id", updateTipoHorario);

router.delete("/tipo-horario/:id", deleteTipoHorario);

export default router;
