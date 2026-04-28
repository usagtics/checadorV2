import { Router } from 'express';
import { crearOferta, obtenerOfertas, obtenerOferta, actualizarOferta, eliminarOferta } from '../controllers/ofertaAcademica.controller.js';

const router = Router();

router.post('/oferta-academica', crearOferta);
router.get('/oferta-academica', obtenerOfertas);
router.get('/oferta-academica/:id', obtenerOferta);
router.put('/oferta-academica/:id', actualizarOferta);
router.delete('/oferta-academica/:id', eliminarOferta);

export default router;