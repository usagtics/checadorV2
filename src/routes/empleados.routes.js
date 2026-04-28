import { Router } from "express";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { authRequired } from "../middlewares/validatetoken.js"; 
import { createEmployeeSchema, updateEmployeeSchema } from "../schemas/empleados.schema.js"; 

import {
  getEmployees, 
  getEmployee, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee
} from "../controllers/empleados.controller.js"; 

const router = Router();

router.post(
  '/employees', 
  authRequired, 
  validateSchema(createEmployeeSchema), 
  createEmployee
);

router.get('/employees', authRequired, getEmployees);
router.get('/employees/:id', authRequired, getEmployee);
router.put('/employees/:id',authRequired, validateSchema(updateEmployeeSchema),updateEmployee);
router.delete('/employees/:id', authRequired, deleteEmployee);

export default router;
