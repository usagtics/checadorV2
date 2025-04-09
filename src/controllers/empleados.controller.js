import Employee from '../models/empleados.model.js';

// Función para obtener todos los empleados
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Función para crear un nuevo empleado
export const createEmployee = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const newEmployee = new Employee({
      name,
      email,
      role,
    });

    const savedEmployee = await newEmployee.save();
    res.json(savedEmployee);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Función para obtener un empleado específico
export const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Función para eliminar un empleado
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Función para actualizar un empleado
export const updateEmployee = async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id, // El ID del empleado que se va a actualizar
      req.body, // El cuerpo de la solicitud contiene los campos a actualizar
      { new: true } // Esto devuelve el documento actualizado en lugar del original
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(updatedEmployee); // Retorna el empleado actualizado
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" }); // Retorna error si algo falla
  }
};

