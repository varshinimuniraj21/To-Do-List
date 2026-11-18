import express from 'express';
import {
  createFocusSession,
  getFocusStats,
  getFocusHistory
} from '../controllers/focusController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createFocusSession);
router.get('/stats', getFocusStats);
router.get('/history', getFocusHistory);

export default router;
