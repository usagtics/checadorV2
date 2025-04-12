import Employee from '../models/empleados.model.js';
import TipoHorario from "../models/tipoHorario.model.js";

// Función para obtener todos los empleados con su tipoHorario
export const getEmployees = async (req, res) => {
  try {
    // Utilizamos .populate() para obtener el tipoHorario relacionado con cada empleado
    const employees = await Employee.find().populate('tipoHorario');
    res.json(employees);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};


export const createEmployee = async (req, res) => {
  try {
    const { name, email, role, tipoHorario } = req.body;


    const tipoHorarioExistente = await TipoHorario.findById(tipoHorario);
    if (!tipoHorarioExistente) {
      return res.status(400).json({ message: "Tipo de horario no encontrado" });
    }

    const newEmployee = new Employee({
      name,
      email,
      role,
      tipoHorario, 
    });

    const savedEmployee = await newEmployee.save();
    res.json(savedEmployee);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};


export const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('tipoHorario');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};


export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};


export const updateEmployee = async (req, res) => {
  try {
    const { name, email, role, tipoHorario } = req.body;

  
    if (tipoHorario) {
      const tipoHorarioExistente = await TipoHorario.findById(tipoHorario);
      if (!tipoHorarioExistente) {
        return res.status(400).json({ message: "Tipo de horario no encontrado" });
      }
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id, 
      {
        name,
        email,
        role,
        tipoHorario, 
      },
      { new: true } 
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(updatedEmployee); 
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error }); // Retorna error si algo falla
  }
};
