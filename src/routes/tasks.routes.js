import { Router } from "express";
import { authRequired } from "../middlewares/validatetoken.js";
import {
  getTasks, 
  getTask, 
  createTasks,
  updateTasks, 
  deleteTasks
} from "../controllers/tasks.controller.js";
import {validateSchema} from "../middlewares/validator.middleware.js";
import {createTaskSchema} from "../schemas/task.schema.js";

const router = Router();

router.post(
  '/tasks', 
 authRequired,
 validateSchema(createTaskSchema),
 createTasks);
router.get('/tasks', authRequired, getTasks);
router.get('/tasks/:id', authRequired, getTask);
router.put('/tasks/:id', authRequired, updateTasks);
router.delete('/tasks/:id', authRequired, deleteTasks);



export default router;
