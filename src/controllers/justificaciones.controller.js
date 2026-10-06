import Justificacion from '../models/justificacion.model.js';

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
        const filtro = req.query.estado ? { estado: req.query.estado } : {};

        const justificaciones = await Justificacion.find(filtro)
            .populate('docente', 'nombre apellidos numeroEmpleado') 
            .populate('revisadoPor', 'username') 
            .sort({ createdAt: -1 });

        res.json(justificaciones);
    } catch (error) {
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