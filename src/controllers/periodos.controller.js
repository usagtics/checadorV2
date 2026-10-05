import Periodo from '../models/periodo.model.js';

export const getPeriodos = async (req, res) => {
    try {
        const periodos = await Periodo.find().sort({ createdAt: -1 });
        res.json(periodos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los periodos" });
    }
};

export const createPeriodo = async (req, res) => {
    try {
        const { nombre, fechaInicio, fechaFin, activo } = req.body;
        

        const nuevoPeriodo = new Periodo({ nombre, fechaInicio, fechaFin, activo });
        const periodoGuardado = await nuevoPeriodo.save();
        res.status(201).json(periodoGuardado);
    } catch (error) {
        res.status(500).json({ message: "Error al crear el periodo" });
    }
};

export const marcarPeriodoActivo = async (req, res) => {
    try {
        const { id } = req.params;

        
        const periodo = await Periodo.findById(id);
        if (!periodo) return res.status(404).json({ message: "Periodo no encontrado" });

        periodo.activo = !periodo.activo;
        
        const periodoActualizado = await periodo.save();

        res.json(periodoActualizado);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el estado del periodo" });
    }
};