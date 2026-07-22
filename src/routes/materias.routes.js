import { Router } from 'express';
import { crearMateria, obtenerMaterias, obtenerMateria, actualizarMateria, eliminarMateria } from '../controllers/materias.controller.js';
import { authRequired } from '../middlewares/validateToken.js'; 

const router = Router();

router.post('/materias', authRequired, crearMateria);
router.get('/materias', authRequired, obtenerMaterias);
router.get('/materias/:id', authRequired, obtenerMateria);
router.put('/materias/:id', authRequired, actualizarMateria);
router.delete('/materias/:id', authRequired, eliminarMateria);

export default router;