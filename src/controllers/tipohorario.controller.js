import TipoHorario from '../models/tipohorario.model.js';
import { createTipoHorarioSchema, updateTipoHorarioSchema } from '../schemas/tipohorario.schema.js';

export const getTipoHorarios = async (req, res) => {
  try {
    const tipos = await TipoHorario.find();
    res.json(tipos);
  } catch (error) {
    console.error("Error al obtener tipos de horario:", error);
    return res.status(500).json({ message: "Error al obtener los tipos de horario" });
  }
};

export const createTipoHorario = async (req, res) => {
  try {
    const parsedData = createTipoHorarioSchema.parse(req.body); 

    const nuevoHorario = new TipoHorario(parsedData);
    const savedHorario = await nuevoHorario.save();

    res.status(201).json(savedHorario); 
  } catch (error) {
    console.error("Error al crear tipo de horario:", error);
    return res.status(400).json({
      message: error.errors?.[0]?.message || "Datos inválidos",
      details: error.errors || []
    });
  }
};

export const getTipoHorario = async (req, res) => {
  try {
    const tipo = await TipoHorario.findById(req.params.id);
    if (!tipo) return res.status(404).json({ message: "Tipo de horario no encontrado" });
    res.json(tipo);
  } catch (error) {
    console.error("Error al obtener tipo de horario:", error);
    return res.status(500).json({ message: "Error al obtener tipo de horario" });
  }
};

export const deleteTipoHorario = async (req, res) => {
  try {
    const deleted = await TipoHorario.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Tipo de horario no encontrado" });
    res.sendStatus(204); // No Content, eliminó correctamente
  } catch (error) {
    console.error("Error al eliminar tipo de horario:", error);
    return res.status(500).json({ message: "Error al eliminar tipo de horario" });
  }
};

export const updateTipoHorario = async (req, res) => {
  try {
    const parsedData = updateTipoHorarioSchema.parse(req.body); 
    const updated = await TipoHorario.findByIdAndUpdate(req.params.id, parsedData, { new: true });

    if (!updated) return res.status(404).json({ message: "Tipo de horario no encontrado" });

    res.json(updated); 
  } catch (error) {
    console.error("Error al actualizar tipo de horario:", error);
    return res.status(400).json({
      message: error.errors?.[0]?.message || "Datos inválidos",
      details: error.errors || []
    });
  }
};