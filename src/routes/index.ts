import { Router } from 'express';
import userRoutes from './userRoutes';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

router.use('/api/users', userRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling middleware
router.use(errorHandler);

export default router;