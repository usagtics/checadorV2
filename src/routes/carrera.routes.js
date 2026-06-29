import { Router } from 'express';
import { getCarreras, createCarrera } from '../controllers/carrera.controller.js';
import { authRequired } from '../middlewares/validateToken.js';


import { validateSchema } from '../middlewares/validator.middleware.js'; 
import { createCarreraSchema } from '../schemas/carrera.schema.js';

const router = Router();


router.get('/carreras', authRequired, getCarreras);
//router.post('/carreras', authRequired, validateSchema(createCarreraSchema), createCarrera);
router.post('/carreras', createCarrera);

export default router;