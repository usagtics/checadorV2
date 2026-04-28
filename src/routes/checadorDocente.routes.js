import { Router } from 'express';
import { registrarAsistenciaQR, obtenerTodasLasAsistencias } from '../controllers/checadorDocente.controller.js';
import { getNominaDetalle } from '../controllers/checadorDocente.controller.js';

const router = Router();

router.post('/checar-qr', registrarAsistenciaQR);
router.get('/asistencias/reporte', obtenerTodasLasAsistencias);
router.get('/asistencias/nomina-detalle', getNominaDetalle);

export default router;