import Grupo from '../models/grupos.model.js';

export const crearGrupo = async (req, res) => {
    console.log("BODY RECIBIDO EN EL SERVER:", req.body);

    try {
        // Añadimos "carrera" para que se reciba desde el frontend
        const { nombre, programa, turno, activo, carrera } = req.body;
        
        const nuevoGrupo = new Grupo({ 
            nombre, 
            programa, 
            turno, 
            activo,
            carrera // Guardamos la carrera a la que pertenece
        });
        
        const grupoGuardado = await nuevoGrupo.save();
        res.status(201).json(grupoGuardado);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el grupo', error: error.message });
    }
};

export const obtenerGrupos = async (req, res) => {
    try {
        // Hacemos una copia de req.query para no mutar el objeto original
        const filtros = { ...req.query }; 
        
        // --- FILTRO DE SEGURIDAD PARA DIRECTIVOS ---
        // Si el usuario existe, NO es super-admin, y tiene carreras asignadas, aplicamos el candado
        if (req.user && req.user.role !== 'super-admin' && req.user.carreras && req.user.carreras.length > 0) {
            filtros.carrera = { $in: req.user.carreras };
        }
        
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