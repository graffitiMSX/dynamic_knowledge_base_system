import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../interfaces/IUser';

export const validateQuery = (params: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (page <= 0 || limit <= 0) {
      res.status(400).json({
        error:
          'Invalid pagination parameters. Page and limit must be positive numbers.',
      });
      return;
    }

    if (limit > 100) {
      res.status(400).json({
        error: 'Limit cannot exceed 100 items per page',
      });
      return;
    }

    // Validate other query parameters if they exist
    for (const param of params) {
      if (req.query[param] && typeof req.query[param] !== 'string') {
        res.status(400).json({
          error: `Invalid ${param} parameter`,
        });
        return;
      }
    }

    req.query.page = page.toString();
    req.query.limit = limit.toString();
    next();
  };
};

export const validateEmail = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const email = req.body.email || req.params.email;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    next();
  };
};

export const validateRole = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.body.role || req.params.role;
    const normalizedRole = role
      ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
      : null;
    const validRoles: UserRole[] = ['Admin', 'Editor', 'Viewer'];

    if (!role || !validRoles.includes(normalizedRole as UserRole)) {
      res.status(400).json({
        error: 'Invalid role. Role must be one of: Admin, Editor, Viewer',
      });
      return;
    }

    if (role != normalizedRole) {
      if (req.body.role) req.body['role'] = normalizedRole;
      else req.params.role = normalizedRole;
    }
    next();
  };
};
