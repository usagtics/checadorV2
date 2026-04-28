import { Router } from 'express';
import { 
    loginDirectivo, 
    registerDirectivo, 
    getDirectivos, 
    deleteDirectivo, 
    updateDirectivoRole,
    verifyToken 
} from '../controllers/directivoAuth.controller.js';

import { validateSchema } from '../middlewares/validator.middleware.js';
import { authRequired } from '../middlewares/validatetoken.js'; 
import { isSuperAdmin } from '../middlewares/validateRole.js';
import { directivoRegisterSchema, directivoLoginSchema } from '../schemas/directivoAuth.schema.js';

const router = Router();

// --- RUTAS DE ACCESO PÚBLICO ---

// Login para directivos
router.post(
    '/directivo/login', 
    validateSchema(directivoLoginSchema), 
    loginDirectivo
);

router.get(
    "/directivo/verify", 
    verifyToken
);


router.post(
    '/directivo/register', 
    authRequired,      
    isSuperAdmin,     
    validateSchema(directivoRegisterSchema), 
    registerDirectivo
);

// Listar todos los directivos
router.get(
    "/directivos", 
    authRequired, 
    isSuperAdmin, 
    getDirectivos
);

// Eliminar un directivo
router.delete(
    "/directivos/:id", 
    authRequired, 
    isSuperAdmin, 
    deleteDirectivo
);

// Actualizar el rango (admin / super-admin)
router.put(
    "/directivos/:id/role", 
    authRequired, 
    isSuperAdmin, 
    updateDirectivoRole
);

export default router;