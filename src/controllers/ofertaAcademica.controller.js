import OfertaAcademica from '../models/ofertaAcademica.model.js';

// 1. Crear una nueva asignación
export const crearOferta = async (req, res) => {
    try {
        let { docente, materia, grupo, horarios, periodo, turno } = req.body; 

        // AJUSTE: Validamos si periodo es nulo, undefined O una cadena vacía
        if (!periodo || periodo === "" || periodo === "null") {
            const periodoActivo = await Periodo.findOne({ activo: true });
            
            if (!periodoActivo) {
                return res.status(400).json({ 
                    message: 'No hay un periodo activo. Por favor, active uno primero.' 
                });
            }
            
            // Asignamos el ID del periodo encontrado
            periodo = periodoActivo._id;
        }
        
        const nuevaOferta = new OfertaAcademica({ 
            docente, 
            materia, 
            grupo, 
            horarios, 
            periodo, // Ahora garantizamos que aquí siempre hay un ObjectId válido
            turno 
        });
        
        const ofertaGuardada = await nuevaOferta.save();
        
        res.status(201).json(ofertaGuardada);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al asignar la oferta académica', 
            error: error.message 
        });
    }
};

export const obtenerOfertas = async (req, res) => {
    try {
        const { programa, turno, periodo } = req.query; 
        
        // 1. Construir filtros directos
        let filtro = {};
        if (periodo) filtro.periodo = periodo;

        // 2. Ejecutar búsqueda
        const ofertas = await OfertaAcademica.find(filtro)
            .populate('docente', 'nombre apellidos')
            .populate('materia', 'nombre')
            .populate('periodo', 'nombre') // Asegúrate que el campo se llame 'nombre' en tu modelo Periodo
            .populate({
                path: 'grupo',
                match: { 
                    ...(programa && { programa }), 
                    ...(turno && { turno }) 
                }
            });

        // 3. Eliminar los que no cumplen el match del grupo
        const resultados = ofertas.filter(o => o.grupo !== null);

        res.json(resultados);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las ofertas', error: error.message });
    }
};

// 3. Obtener una sola oferta por ID
export const obtenerOferta = async (req, res) => {
    try {
        const oferta = await OfertaAcademica.findById(req.params.id)
            .populate('docente', 'nombre apellidos numeroEmpleado')
            .populate('materia', 'nombre clave')
            .populate('periodo', 'nombre activo') // AQUÍ TAMBIÉN LO AGREGAMOS
            .populate('grupo', 'nombre programa turno');
            
        if (!oferta) return res.status(404).json({ message: 'Oferta académica no encontrada' });
        res.json(oferta);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la oferta', error: error.message });
    }
};

export const actualizarOferta = async (req, res) => {
    try {
        const ofertaActualizada = await OfertaAcademica.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        )
        .populate('periodo', 'nombre') // Importante para que el frontend no reciba un ID vacío
        .populate('materia', 'nombre');
        
        if (!ofertaActualizada) return res.status(404).json({ message: 'Oferta no encontrada' });
        res.json(ofertaActualizada);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar', error: error.message });
    }
};

// 5. Eliminar una oferta
export const eliminarOferta = async (req, res) => {
    try {
        const ofertaEliminada = await OfertaAcademica.findByIdAndDelete(req.params.id);
        if (!ofertaEliminada) return res.status(404).json({ message: 'Oferta académica no encontrada' });
        res.json({ message: 'Oferta académica eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la oferta', error: error.message });
    }
};