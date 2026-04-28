import Plantel from '../models/planteles.model.js';

export const getPlanteles = async (req, res) => {
  try {
    const planteles = await Plantel.find().exec();
    return res.json(planteles);
  } catch (error) {
    console.error("Error en getPlanteles:", error);
    return res.status(500).json({ message: "Error al obtener los planteles" });
  }
};

export const createPlantel = async (req, res) => {
  try {
    // 1. Extraemos SOLO lo que el frontend envía
    const { nombre, direccion, activo, ipsPermitidas } = req.body;

    // 2. Validación extra de seguridad (aunque Zod ya lo hace)
    if (!ipsPermitidas || !Array.isArray(ipsPermitidas) || ipsPermitidas.length === 0) {
      return res.status(400).json({ message: "Debes registrar al menos una IP autorizada." });
    }

    const newPlantel = new Plantel({
      nombre,
      direccion,
      activo,
      ipsPermitidas // Guardamos el array de IPs
    });

    const savedPlantel = await newPlantel.save();
    res.json(savedPlantel);
  } catch (error) {
    console.error("Error al crear el plantel:", error);
    return res.status(500).json({ message: "Error al crear el plantel", error: error.message });
  }
};

export const getPlantel = async (req, res) => {
  try {
    const plantel = await Plantel.findById(req.params.id);
    if (!plantel) return res.status(404).json({ message: 'Plantel no encontrado' });
    res.json(plantel);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el plantel" });
  }
};

export const deletePlantel = async (req, res) => {
  try {
    const plantel = await Plantel.findByIdAndDelete(req.params.id);
    if (!plantel) return res.status(404).json({ message: 'Plantel no encontrado' });
    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar el plantel" });
  }
};

export const updatePlantel = async (req, res) => {
  try {
    const updatedPlantel = await Plantel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedPlantel) {
      return res.status(404).json({ message: 'Plantel no encontrado' });
    }

    res.json(updatedPlantel);
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar el plantel" });
  }
};