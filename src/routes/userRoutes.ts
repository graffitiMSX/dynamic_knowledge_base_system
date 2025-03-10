import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { checkRole } from '../middleware/auth';
import { validateEmail, validateRole } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { seedDefaultUsers } from '../database/seeds/defaultUsers';

const router = Router();
const userService = new UserService();
const userController = new UserController(userService);

// If starting in development mode, seed the database with default users
if (process.env.NODE_ENV != 'PROD') {
  console.log('Running in development mode');
  seedDefaultUsers(userService);
}

// Public route
router.post(
  '/login',
  validateEmail(),
  userController.login.bind(userController)
);

// Protected routes
router.get(
  '/',
  authenticateToken,
  checkRole(['Admin']),
  userController.getAll.bind(userController)
);
router.get(
  '/:id',
  authenticateToken,
  checkRole(['Admin']),
  userController.getById.bind(userController)
);
router.get(
  '/role/:role',
  authenticateToken,
  checkRole(['Admin']),
  userController.getByRole.bind(userController)
);
router.put(
  '/:id',
  authenticateToken,
  validateEmail(),
  validateRole(),
  checkRole(['Admin']),
  userController.update.bind(userController)
);
router.post(
  '/',
  validateEmail(),
  validateRole(),
  userController.create.bind(userController)
);
router.delete(
  '/:id',
  authenticateToken,
  checkRole(['Admin']),
  userController.delete.bind(userController)
);
router.post(
  '/logout',
  authenticateToken,
  userController.logout.bind(userController)
);
router.post(
  '/refresh-token',
  authenticateToken,
  userController.refreshToken.bind(userController)
);

export default router;
