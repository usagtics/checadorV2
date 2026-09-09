import Grupo from '../models/grupos.model.js';
import OfertaAcademica from '../models/ofertaAcademica.model.js';

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
        let idsGruposEnPeriodo = null;
        
        if (req.query.periodo) {
            const ofertasDelPeriodo = await OfertaAcademica.find({ periodo: req.query.periodo }).select('grupo');
            idsGruposEnPeriodo = ofertasDelPeriodo.map(o => o.grupo);
        }

        const query = {};
        
        if (idsGruposEnPeriodo) {
            query._id = { $in: idsGruposEnPeriodo };
        }

        // Copiamos otros filtros si el usuario mandó programa u otros parámetros
        if (req.query.programa) {
            query.programa = req.query.programa;
        }

        // 3. Consultamos los grupos iniciales
        let grupos = await Grupo.find(query);

        // 4. Aplicamos el filtro de seguridad de carreras en memoria o mediante lógica limpia
        if (req.user && req.user.role !== 'super-admin' && req.user.carreras && req.user.carreras.length > 0) {
            grupos = grupos.filter(g => {
                // Si el grupo no tiene carrera asignada o su carrera coincide con las permitidas del directivo, pasa
                return !g.carrera || req.user.carreras.map(c => c.toString()).includes(g.carrera.toString());
            });
        }

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