import { Router } from 'express';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling middleware
router.use(errorHandler);

export default router;