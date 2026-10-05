import Grupo from '../models/grupos.model.js';
import OfertaAcademica from '../models/ofertaAcademica.model.js';

export const crearGrupo = async (req, res) => {
    console.log("BODY RECIBIDO EN EL SERVER:", req.body);

    try {
        const { nombre, programa, turno, activo, carrera } = req.body;
        
        const nuevoGrupo = new Grupo({ 
            nombre, 
            programa, 
            turno, 
            activo,
            carrera
        });
        
        const grupoGuardado = await nuevoGrupo.save();
        res.status(201).json(grupoGuardado);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el grupo', error: error.message });
    }
};

export const obtenerGrupos = async (req, res) => {
    try {
        let idsGruposEnPeriodo = null;
        
        if (req.query.periodo) {
            const ofertasDelPeriodo = await OfertaAcademica.find({ periodo: req.query.periodo }).select('grupo');
            idsGruposEnPeriodo = ofertasDelPeriodo.map(o => o.grupo);
        }

        const query = {};
        
        if (idsGruposEnPeriodo) {
            query._id = { $in: idsGruposEnPeriodo };
        }

        if (req.query.programa) {
            query.programa = req.query.programa;
        }


        if (req.user && req.user.role !== 'super-admin' && req.user.carreras && req.user.carreras.length > 0) {
   
            query.carrera = { $in: req.user.carreras };
        }

        const grupos = await Grupo.find(query);

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