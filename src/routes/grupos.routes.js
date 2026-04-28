import { Router } from 'express';
import { crearGrupo, obtenerGrupos, obtenerGrupo, actualizarGrupo, eliminarGrupo } from '../controllers/grupos.controller.js';

const router = Router();

router.post('/grupos', crearGrupo);
router.get('/grupos', obtenerGrupos);
router.get('/grupos/:id', obtenerGrupo);
router.put('/grupos/:id', actualizarGrupo);
router.delete('/grupos/:id', eliminarGrupo);

export default router;