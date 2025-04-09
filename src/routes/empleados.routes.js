import { Router } from "express";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { authRequired } from "../middlewares/validatetoken.js"; // Verifica que esta sea la ruta correcta
import { createEmployeeSchema, updateEmployeeSchema } from "../schemas/empleados.schema.js"; 

import {
  getEmployees, 
  getEmployee, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee
} from "../controllers/empleados.controller.js"; // Controlador de empleados

const router = Router();

router.post(
  '/employees', 
  authRequired, // Verifica si el usuario está autenticado
  validateSchema(createEmployeeSchema), // Validación de datos del empleado
  createEmployee
);

router.get('/employees', authRequired, getEmployees);
router.get('/employees/:id', authRequired, getEmployee);
router.put('/employees/:id',authRequired, validateSchema(updateEmployeeSchema),updateEmployee);
router.delete('/employees/:id', authRequired, deleteEmployee);

export default router;
