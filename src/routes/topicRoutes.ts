import { Router } from 'express';
import { TopicController } from '../controllers/TopicController';
import { TopicService } from '../services/TopicService';
import { authenticateToken, checkRole } from '../middleware/auth';
import { validateQuery } from '../middleware/validation';

const router = Router();
const topicService = new TopicService();
const topicController = new TopicController(topicService);

router.get(
  '/',
  authenticateToken,
  validateQuery(['page', 'limit']),
  topicController.getAll.bind(topicController)
);
router.get(
  '/:id',
  authenticateToken,
  topicController.getById.bind(topicController)
);
router.get(
  '/:id/versions',
  authenticateToken,
  topicController.getVersions.bind(topicController)
);
router.get(
  '/:id/versions/:version',
  authenticateToken,
  topicController.getVersion.bind(topicController)
);
router.post(
  '/',
  authenticateToken,
  topicController.create.bind(topicController)
);
router.put(
  '/:id',
  authenticateToken,
  checkRole(['Admin', 'Editor']),
  topicController.update.bind(topicController)
);
router.delete(
  '/:id',
  authenticateToken,
  checkRole(['Admin']),
  topicController.delete.bind(topicController)
);
router.get(
  '/hierarchy',
  authenticateToken,
  topicController.getHierarchy.bind(topicController)
);
router.get(
  '/path/:startId/:endId',
  authenticateToken,
  topicController.findPath.bind(topicController)
);

export default router;
