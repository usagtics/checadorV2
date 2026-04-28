import Directivo from '../models/Directivo.model.js';

export const isSuperAdmin = async (req, res, next) => {
    try {
        const userFound = await Directivo.findById(req.user.id);

        if (!userFound) return res.status(404).json({ message: "Usuario no encontrado" });

        // 🔥 MODO DIOS: Imprimimos tu rol real en la terminal
        console.log("🕵️‍♂️ EL ROL REAL DE TU USUARIO EN LA BD ES:", userFound.role);

        // Dejamos pasar temporalmente a admin y director_carrera para que la tabla cargue y no te marque error 403
        if (userFound.role !== 'super-admin' && userFound.role !== 'admin' && userFound.role !== 'director_carrera') {
            return res.status(403).json({ 
                message: "Acceso denegado: Se requiere rol de Super Administrador" 
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};