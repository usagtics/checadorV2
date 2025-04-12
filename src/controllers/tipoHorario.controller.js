import TipoHorario from "../models/tipoHorario.model.js";


export const getAllTipoHorarios = async (req, res) => {
  try {
    const tipoHorarios = await TipoHorario.find();
    res.status(200).json(tipoHorarios);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los tipos de horario", error });
  }
};

export const createTipoHorario = async (req, res) => {
    const { nombre, descripcion, tipoHorarioId } = req.body;
  
    if (!name || !email || !role || !tipoHorarioId) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
      }
    
  
    try {
      const tipoHorario = new TipoHorario({ nombre, descripcion: descripcion || "" }); // Asegúrate de tener un valor para descripcion
      await tipoHorario.save();
      res.status(201).json({ message: "Tipo de horario creado correctamente", tipoHorario });
    } catch (error) {
      console.error(error);  
      res.status(500).json({ message: "Error al crear el tipo de horario", error });
    }
  };
  


export const updateTipoHorario = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  try {
    const tipoHorario = await TipoHorario.findByIdAndUpdate(id, { nombre, descripcion }, { new: true });
    if (!tipoHorario) {
      return res.status(404).json({ message: "Tipo de horario no encontrado" });
    }
    res.status(200).json({ message: "Tipo de horario actualizado correctamente", tipoHorario });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el tipo de horario", error });
  }
};


export const deleteTipoHorario = async (req, res) => {
  const { id } = req.params;
  try {
    const tipoHorario = await TipoHorario.findByIdAndDelete(id);
    if (!tipoHorario) {
      return res.status(404).json({ message: "Tipo de horario no encontrado" });
    }
    res.status(200).json({ message: "Tipo de horario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el tipo de horario", error });
  }
};
