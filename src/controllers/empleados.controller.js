import Employee from '../models/empleados.model.js';
import tipoHorarioModel from '../models/tipoHorario.model.js';
import Plantel from '../models/planteles.model.js';

// 📌 Obtener todos los empleados
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('tipoHorario', 'descripcion')
      .populate('plantel', 'nombre') // 🔹 mostrar nombre del plantel
      .exec();

    employees.forEach(employee => {
      if (!employee.tipoHorario) employee.tipoHorario = null;
      if (!employee.plantel) employee.plantel = null;
    });

    return res.json(employees);
  } catch (error) {
    console.error("Error en getEmployees:", error);
    return res.status(500).json({ message: "Error al obtener los empleados" });
  }
};

// 📌 Crear empleado
export const createEmployee = async (req, res) => {
  try {
    const { name, email, role, tipoHorario, plantel } = req.body;

    // 🔸 Validar tipo de horario
    if (tipoHorario) {
      const horarioExists = await tipoHorarioModel.findById(tipoHorario);
      if (!horarioExists) {
        return res.status(400).json({ message: 'Tipo de horario no válido' });
      }
    }

    // 🔸 Validar plantel
    if (plantel) {
      const plantelExists = await Plantel.findById(plantel);
      if (!plantelExists) {
        return res.status(400).json({ message: 'Plantel no válido' });
      }
    }

    const newEmployee = new Employee({
      name,
      email,
      role,
      tipoHorario,
      plantel, // 🔹 guardar el plantel
    });

    const savedEmployee = await newEmployee.save();

    const populatedEmployee = await Employee.findById(savedEmployee._id)
      .populate('tipoHorario', 'descripcion')
      .populate('plantel', 'nombre'); // 🔹 incluir el plantel en la respuesta

    res.json(populatedEmployee);
  } catch (error) {
    console.error("Error al crear el empleado:", error);
    return res.status(500).json({ message: "Error al crear el empleado", error: error.message });
  }
};

// 📌 Obtener un empleado por ID
export const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('tipoHorario', 'descripcion')
      .populate('plantel', 'nombre');

    if (!employee) return res.status(404).json({ message: 'Empleado no encontrado' });
    res.json(employee);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el empleado" });
  }
};

// 📌 Eliminar empleado
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Empleado no encontrado' });

    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar el empleado" });
  }
};

// 📌 Actualizar empleado
export const updateEmployee = async (req, res) => {
  try {
    const { tipoHorario, plantel } = req.body;

    // 🔸 Validar tipo de horario
    if (tipoHorario) {
      const horarioExists = await tipoHorarioModel.findById(tipoHorario);
      if (!horarioExists) {
        return res.status(400).json({ message: 'Tipo de horario no válido' });
      }
    }

    // 🔸 Validar plantel
    if (plantel) {
      const plantelExists = await Plantel.findById(plantel);
      if (!plantelExists) {
        return res.status(400).json({ message: 'Plantel no válido' });
      }
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('tipoHorario', 'descripcion')
      .populate('plantel', 'nombre');

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    res.json(updatedEmployee);
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar el empleado" });
  }
};
