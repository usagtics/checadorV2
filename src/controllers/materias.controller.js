import Materia from '../models/materias.model.js';
// Importamos Grupo y OfertaAcademica para poder triangular y filtrar los datos
import Grupo from '../models/grupos.model.js';
import OfertaAcademica from '../models/ofertaAcademica.model.js';

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
        // 1. Si no hay usuario, no tiene carreras asignadas, o es super-admin, 
        // le mostramos todo el catálogo completo de materias de la universidad.
        if (!req.user || !req.user.carreras || req.user.carreras.length === 0 || req.user.role === 'super-admin') {
            const materias = await Materia.find();
            return res.json(materias);
        }

        // --- FILTRO DE SEGURIDAD PARA DIRECTIVOS ---
        
        // 2. Encontramos los grupos que pertenecen a las carreras autorizadas
        const gruposPermitidos = await Grupo.find({ carrera: { $in: req.user.carreras } }).select('_id');
        const idsGruposPermitidos = gruposPermitidos.map(g => g._id);

        // 3. Buscamos las clases (ofertas académicas) vinculadas a esos grupos
        const ofertas = await OfertaAcademica.find({ grupo: { $in: idsGruposPermitidos } }).select('materia');
        
        // 4. Extraemos los IDs únicos de las materias que se imparten en esas clases
        const idsMateriasPermitidas = [...new Set(ofertas.map(o => o.materia.toString()))];

        // 5. Devolvemos únicamente las materias que coincidan con esos IDs
        const materias = await Materia.find({ _id: { $in: idsMateriasPermitidas } });
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