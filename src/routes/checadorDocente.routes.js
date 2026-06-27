import { Router } from 'express';
import { 
    registrarAsistenciaQR, 
    obtenerTodasLasAsistencias, 
    justificarAsistencia, 
    getDesgloseDia,
    getNominaDetalle 
} from '../controllers/checadorDocente.controller.js';

import { authRequired } from '../middlewares/validateToken.js'; 

const router = Router();

// 🔓 RUTA PÚBLICA (El checador físico no necesita token de directivo)
router.post('/checar-qr', registrarAsistenciaQR);

// 🔒 RUTAS PROTEGIDAS (Solo directivos autenticados pueden entrar, el middleware inyecta req.user)
router.get('/asistencias/reporte', authRequired, obtenerTodasLasAsistencias);
router.get('/asistencias/nomina-detalle', authRequired, getNominaDetalle);
router.put('/asistencias/justificar/:id', authRequired, justificarAsistencia);    
router.get('/asistencias/desglose/:docenteId', authRequired, getDesgloseDia);

export default router;