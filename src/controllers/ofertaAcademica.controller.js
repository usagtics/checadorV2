import OfertaAcademica from '../models/ofertaAcademica.model.js';

// 1. Crear una nueva asignación
export const crearOferta = async (req, res) => {
    try {
        const { docente, materia, grupo, horarios, periodo } = req.body;
        const nuevaOferta = new OfertaAcademica({ docente, materia, grupo, horarios, periodo });
        const ofertaGuardada = await nuevaOferta.save();
        res.status(201).json(ofertaGuardada);
    } catch (error) {
        res.status(500).json({ message: 'Error al asignar la oferta académica', error: error.message });
    }
};

// 2. Obtener todas las ofertas (Con filtros inteligentes para TSU, Licenciatura, etc.)
export const obtenerOfertas = async (req, res) => {
    try {
        const { programa, turno } = req.query;
        let filtroGrupo = {};
        
        if (programa) filtroGrupo.programa = programa;
        if (turno) filtroGrupo.turno = turno;

        const ofertas = await OfertaAcademica.find()
            .populate('docente', 'nombre apellidos numeroEmpleado') 
            .populate('materia', 'nombre clave')
            .populate({
                path: 'grupo',
                select: 'nombre programa turno',
                match: Object.keys(filtroGrupo).length > 0 ? filtroGrupo : {}
            });

        // Filtramos las que no coincidan con el programa/turno seleccionado
        const ofertasFiltradas = ofertas.filter(o => o.grupo !== null);

        res.json(ofertasFiltradas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las ofertas académicas', error: error.message });
    }
};

// 3. Obtener una sola oferta por ID
export const obtenerOferta = async (req, res) => {
    try {
        const oferta = await OfertaAcademica.findById(req.params.id)
            .populate('docente', 'nombre apellidos numeroEmpleado')
            .populate('materia', 'nombre clave')
            .populate('grupo', 'nombre programa turno');
            
        if (!oferta) return res.status(404).json({ message: 'Oferta académica no encontrada' });
        res.json(oferta);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la oferta', error: error.message });
    }
};

// 4. Actualizar una oferta (LA QUE FALTABA)
export const actualizarOferta = async (req, res) => {
    try {
        const ofertaActualizada = await OfertaAcademica.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        if (!ofertaActualizada) return res.status(404).json({ message: 'Oferta académica no encontrada' });
        res.json(ofertaActualizada);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la oferta', error: error.message });
    }
};

// 5. Eliminar una oferta (LA OTRA QUE FALTABA)
export const eliminarOferta = async (req, res) => {
    try {
        const ofertaEliminada = await OfertaAcademica.findByIdAndDelete(req.params.id);
        if (!ofertaEliminada) return res.status(404).json({ message: 'Oferta académica no encontrada' });
        res.json({ message: 'Oferta académica eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la oferta', error: error.message });
    }
};