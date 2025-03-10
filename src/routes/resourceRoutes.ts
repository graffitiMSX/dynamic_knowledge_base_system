import { Router } from 'express';
import { ResourceController } from '../controllers/ResourceController';
import { authenticateToken, checkRole } from '../middleware/auth';
import { ResourceService } from '../services/ResourceService';

const router = Router();
const resourceService = new ResourceService();
const resourceController = new ResourceController(resourceService);

router.get(
  '/',
  authenticateToken,
  resourceController.getAll.bind(resourceController)
);
router.get(
  '/:id',
  authenticateToken,
  resourceController.getById.bind(resourceController)
);
router.get(
  '/topic/:topicId',
  authenticateToken,
  resourceController.getByTopicId.bind(resourceController)
);
router.post(
  '/',
  authenticateToken,
  resourceController.create.bind(resourceController)
);
router.put(
  '/:id',
  checkRole(['Admin', 'Editor']),
  authenticateToken,
  resourceController.update.bind(resourceController)
);
router.delete(
  '/:id',
  checkRole(['Admin']),
  authenticateToken,
  resourceController.delete.bind(resourceController)
);

export default router;
