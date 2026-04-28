import { Router } from 'express';
// Asegúrate de importar tu función original de crearDocente y las nuevas
import { crearDocente, obtenerDocentes, obtenerDocente, actualizarDocente, eliminarDocente, loginDocente, verifyDocenteToken } from '../controllers/docentes.controller.js';

const router = Router();

router.post('/docentes', crearDocente); // La que ya tenías
router.get('/docentes', obtenerDocentes);
router.get('/docentes/:id', obtenerDocente);
router.put('/docentes/:id', actualizarDocente);
router.delete('/docentes/:id', eliminarDocente);
router.post('/login-docente', loginDocente);
router.get('/verify-docente', verifyDocenteToken);

export default router;