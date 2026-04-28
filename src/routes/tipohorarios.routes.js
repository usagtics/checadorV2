import { Router } from 'express';
import {
  getTipoHorarios,
  createTipoHorario,
  getTipoHorario,
  deleteTipoHorario,
  updateTipoHorario
} from '../controllers/tipohorario.controller.js';

const router = Router();

router.get('/', getTipoHorarios); 
router.post('/', createTipoHorario); 
router.get('/:id', getTipoHorario); 
router.delete('/:id', deleteTipoHorario); 
router.put('/:id', updateTipoHorario); 

export default router;
