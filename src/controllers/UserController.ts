import { Request, Response } from 'express';
import { User } from '../models/User';
import { UserService } from '../services/UserService';
import { UserRole } from '../interfaces/IUser';
import { BaseController } from './BaseController';

export class UserController extends BaseController<User> {
  constructor(private userService: UserService) {
    super(userService);
  }

  async getByRole(req: Request, res: Response): Promise<void> {
    try {
      const { role } = req.params;
      const users = await this.userService.findByRole(role as UserRole);
      res.json(users);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const authResult = await this.userService.authenticate(email, password);
      res.json(authResult);
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      await this.userService.logout(refreshToken);
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.userService.refreshToken(refreshToken);
      res.json(tokens);
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }
}