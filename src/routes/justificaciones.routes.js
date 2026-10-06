import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
    crearJustificacion, 
    obtenerMisJustificaciones, 
    obtenerTodasJustificaciones, 
    actualizarEstadoJustificacion 
} from '../controllers/justificaciones.controller.js';
import { authRequired } from '../middlewares/validateToken.js'; 

const router = Router();


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/justificaciones';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'evidencia-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
});


router.post('/', authRequired, upload.single('evidencia'), crearJustificacion);

router.get('/mis-solicitudes', authRequired, obtenerMisJustificaciones);


router.get('/', authRequired, obtenerTodasJustificaciones);

router.put('/:id/estado', authRequired, actualizarEstadoJustificacion);

export default router;