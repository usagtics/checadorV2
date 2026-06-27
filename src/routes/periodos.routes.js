import { Router } from 'express';
import { getPeriodos, createPeriodo, marcarPeriodoActivo } from '../controllers/periodos.controller.js';
import { validateSchema } from '../middlewares/validator.middleware.js'; // Ajusta la ruta si es diferente
import { crearPeriodoSchema } from '../schemas/periodo.schema.js';

const router = Router();

router.get('/periodos', getPeriodos);
router.post('/periodos', validateSchema(crearPeriodoSchema), createPeriodo);
// Ruta especial para el switch de encendido
router.patch('/periodos/:id/activo', marcarPeriodoActivo); 

export default router;