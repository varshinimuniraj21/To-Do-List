import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  getTasksByDate,
  getUpcomingDeadlines
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All task routes require JWT auth

router.route('/')
  .post(createTask)
  .get(getTasks);

router.get('/by-date', getTasksByDate);
router.get('/upcoming', getUpcomingDeadlines);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

router.patch('/:id/toggle', toggleTaskComplete);

export default router;
