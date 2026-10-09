import path from 'path';
import fs from 'fs';
import Justificacion from '../models/justificacion.model.js';
import Docente from '../models/docentes.model.js'; 

export const crearJustificacion = async (req, res) => {
    try {
        const { fechaAusencia, motivo, descripcion } = req.body;
        const docenteId = req.user.id; 

        const evidencia = req.file ? req.file.filename : null;

        const nuevaJustificacion = new Justificacion({
            docente: docenteId,
            fechaAusencia,
            motivo,
            descripcion,
            evidencia
        });

        const justificacionGuardada = await nuevaJustificacion.save();
        res.status(201).json(justificacionGuardada);
    } catch (error) {
        console.error("Error al crear justificación:", error);
        res.status(500).json({ message: ['Error al procesar la solicitud de justificación'] });
    }
};

export const obtenerMisJustificaciones = async (req, res) => {
    try {
        const justificaciones = await Justificacion.find({ docente: req.user.id })
            .sort({ createdAt: -1 }); 
        
        res.json(justificaciones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const obtenerTodasJustificaciones = async (req, res) => {
    try {
        const { estado } = req.query;
        let filtro = estado ? { estado } : {};

        const userRole = req.user.role;
        const userCarreras = req.user.carreras || []; 

        if (userRole !== 'super-admin' && userCarreras.length > 0) {
            const docentesDelArea = await Docente.find({ 
                carreras: { $in: userCarreras } 
            }).select('_id');

            const docenteIds = docentesDelArea.map(d => d._id);

            filtro.docente = { $in: docenteIds };
        }

        const justificaciones = await Justificacion.find(filtro)
            .populate('docente', 'nombre apellidos numeroEmpleado carreras') 
            .populate('revisadoPor', 'username') 
            .sort({ createdAt: -1 });

        res.json(justificaciones);
    } catch (error) {
        console.error("Error al obtener justificaciones:", error);
        res.status(500).json({ message: error.message });
    }
};

export const actualizarEstadoJustificacion = async (req, res) => {
    try {
        const { estado, comentariosDirectivo } = req.body;
        const adminId = req.user.id; 

        const justificacionActualizada = await Justificacion.findByIdAndUpdate(
            req.params.id,
            {
                estado, 
                comentariosDirectivo,
                revisadoPor: adminId 
            },
            { new: true }
        ).populate('docente', 'nombre apellidos');

        if (!justificacionActualizada) {
            return res.status(404).json({ message: 'Justificación no encontrada' });
        }

        res.json(justificacionActualizada);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const obtenerEvidencia = async (req, res) => {
    try {
        const { filename } = req.params;
        
        const filepath = path.resolve('uploads/justificaciones', filename);

        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ message: "El archivo no existe o fue eliminado." });
        }

        res.sendFile(filepath);
    } catch (error) {
        console.error("Error al obtener evidencia:", error);
        res.status(500).json({ message: "Error interno al obtener el archivo." });
    }
};
