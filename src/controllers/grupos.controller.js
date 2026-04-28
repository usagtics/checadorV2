import Grupo from '../models/grupos.model.js';

export const crearGrupo = async (req, res) => {
    console.log("BODY RECIBIDO EN EL SERVER:", req.body);

    try {
        const { nombre, programa, turno, activo } = req.body;
        
        const nuevoGrupo = new Grupo({ 
            nombre, 
            programa, 
            turno, 
            activo 
        });
        
        const grupoGuardado = await nuevoGrupo.save();
        res.status(201).json(grupoGuardado);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el grupo', error: error.message });
    }
};

export const obtenerGrupos = async (req, res) => {
    try {
        // --- SUPERPODER AÑADIDO: Filtros dinámicos ---
        // Si React pide /api/grupos?programa=TSU, req.query tendrá { programa: 'TSU' }
        // Mongoose usará eso para filtrar. Si no mandan nada, trae todos.
        const filtros = req.query || {}; 
        
        const grupos = await Grupo.find(filtros);
        res.json(grupos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener grupos', error: error.message });
    }
};

export const obtenerGrupo = async (req, res) => {
    try {
        const grupo = await Grupo.findById(req.params.id);
        if (!grupo) return res.status(404).json({ message: 'Grupo no encontrado' });
        res.json(grupo);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el grupo', error: error.message });
    }
};

export const actualizarGrupo = async (req, res) => {
    try {
        const grupoActualizado = await Grupo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!grupoActualizado) return res.status(404).json({ message: 'Grupo no encontrado' });
        res.json(grupoActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el grupo', error: error.message });
    }
};

export const eliminarGrupo = async (req, res) => {
    try {
        const grupoEliminado = await Grupo.findByIdAndDelete(req.params.id);
        if (!grupoEliminado) return res.status(404).json({ message: 'Grupo no encontrado' });
        res.json({ message: 'Grupo eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el grupo', error: error.message });
    }
};