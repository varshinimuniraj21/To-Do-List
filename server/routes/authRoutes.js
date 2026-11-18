import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  getDefaultUser,
  updatePreferences
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/default-user', getDefaultUser);
router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);

export default router;
