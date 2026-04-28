import { Router } from 'express';
import { crearMateria, obtenerMaterias, obtenerMateria, actualizarMateria, eliminarMateria } from '../controllers/materias.controller.js';

const router = Router();

router.post('/materias', crearMateria);
router.get('/materias', obtenerMaterias);
router.get('/materias/:id', obtenerMateria);
router.put('/materias/:id', actualizarMateria);
router.delete('/materias/:id', eliminarMateria);

export default router;