import { Router } from 'express';
import { crearDocente, obtenerDocentes, obtenerDocente, actualizarDocente, eliminarDocente, loginDocente, verifyDocenteToken } from '../controllers/docentes.controller.js';
import { authRequired } from '../middlewares/validateToken.js';

const router = Router();


router.post('/docentes', authRequired, crearDocente); 
router.get('/docentes', authRequired, obtenerDocentes);
router.get('/docentes/:id', authRequired, obtenerDocente);
router.put('/docentes/:id', authRequired, actualizarDocente);
router.delete('/docentes/:id', authRequired, eliminarDocente);

router.post('/login-docente', loginDocente);
router.get('/verify-docente', verifyDocenteToken);

export default router;