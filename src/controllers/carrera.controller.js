import Carrera from '../models/carrera.model.js';

export const getCarreras = async (req, res) => {
    try {
        const carreras = await Carrera.find().sort({ nombre: 1 });
        res.json(carreras);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las carreras" });
    }
};

export const createCarrera = async (req, res) => {
    try {
        const { clave, nombre, campus } = req.body;
        const nuevaCarrera = new Carrera({ clave, nombre, campus });
        const carreraGuardada = await nuevaCarrera.save();
        res.json(carreraGuardada);
    } catch (error) {
        res.status(500).json({ message: "Error al registrar la carrera" });
    }
};