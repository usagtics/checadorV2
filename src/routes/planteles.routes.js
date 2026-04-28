import { Router } from 'express';
import { 
  getPlanteles, 
  createPlantel, 
  getPlantel, 
  updatePlantel, 
  deletePlantel 
} from '../controllers/planteles.controller.js';


const router = Router();

router.get('/planteles', getPlanteles);
router.post('/planteles', createPlantel);
router.get('/planteles/:id', getPlantel);
router.put('/planteles/:id', updatePlantel);
router.delete('/planteles/:id', deletePlantel);

export default router;
