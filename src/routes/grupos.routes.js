import { Router } from 'express';
import { crearGrupo, obtenerGrupos, obtenerGrupo, actualizarGrupo, eliminarGrupo } from '../controllers/grupos.controller.js';
import { authRequired } from '../middlewares/validateToken.js'; 

const router = Router();

router.post('/grupos', authRequired, crearGrupo);
router.get('/grupos', authRequired, obtenerGrupos);
router.get('/grupos/:id', authRequired, obtenerGrupo);
router.put('/grupos/:id', authRequired, actualizarGrupo);
router.delete('/grupos/:id', authRequired, eliminarGrupo);

export default router;