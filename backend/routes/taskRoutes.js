import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { createTask, getTasks, updateTask, deleteTask } from '../controllers/taskController.js';

const router = express.Router();

router.use(authMiddleware); // Apply auth middleware to all routes

router.post('/', createTask);
router.get('/', getTasks);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

export default router;
