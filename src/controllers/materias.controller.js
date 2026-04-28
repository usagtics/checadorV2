import Materia from '../models/materias.model.js';

export const crearMateria = async (req, res) => {
    try {
        const { nombre, clave } = req.body;
        const nuevaMateria = new Materia({ nombre, clave });
        const materiaGuardada = await nuevaMateria.save();
        res.status(201).json(materiaGuardada);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la materia', error: error.message });
    }
};

export const obtenerMaterias = async (req, res) => {
    try {
        const materias = await Materia.find();
        res.json(materias);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener materias', error: error.message });
    }
};

export const obtenerMateria = async (req, res) => {
    try {
        const materia = await Materia.findById(req.params.id);
        if (!materia) return res.status(404).json({ message: 'Materia no encontrada' });
        res.json(materia);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la materia', error: error.message });
    }
};

export const actualizarMateria = async (req, res) => {
    try {
        const materiaActualizada = await Materia.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!materiaActualizada) return res.status(404).json({ message: 'Materia no encontrada' });
        res.json(materiaActualizada);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la materia', error: error.message });
    }
};

export const eliminarMateria = async (req, res) => {
    try {
        const materiaEliminada = await Materia.findByIdAndDelete(req.params.id);
        if (!materiaEliminada) return res.status(404).json({ message: 'Materia no encontrada' });
        res.json({ message: 'Materia eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la materia', error: error.message });
    }
};