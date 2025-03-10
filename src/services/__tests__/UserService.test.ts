import { UserService } from '../UserService';
import { User } from '../../models/User';
import { UserRole } from '../../interfaces/IUser';
import { describe, it, expect, beforeEach } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Define enum values for testing
enum TestUserRole {
  USER = 'user',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

describe('UserService', () => {
  let service: UserService;
  let users: User[];

  beforeEach(() => {
    service = new UserService();
    
    // Create test users with different roles
    users = [
      new User('Admin User', 'admin@example.com', 'Admin' as UserRole),
      new User('Editor One', 'editor1@example.com', 'Editor' as UserRole),
      new User('Editor Two', 'editor2@example.com', 'Editor' as UserRole),
      new User('Viewer One', 'viewer1@example.com', 'Viewer' as UserRole),
      new User('Viewer Two', 'viewer2@example.com', 'Viewer' as UserRole),
      new User('Mixed Case', 'mixed@example.com', 'eDiToR' as UserRole)
    ];
    // Add users to service
    users.forEach(user => {
      // @ts-ignore - Accessing private property for testing
      service.items.set(user.id, user);
    });
  });

  describe('findByRole', () => {
      
    it('should find users by role with exact match', async () => {
      const editors = await service.findByRole('Editor' as UserRole);
      
      expect(editors).toHaveLength(2);
      expect(editors.every(user => user.role === 'Editor')).toBe(true);
      expect(editors.map(user => user.email)).toEqual([
        'editor1@example.com',
        'editor2@example.com'
      ]);
    });
  
    it('should normalize role case and find users', async () => {
      const viewers = await service.findByRole('viewer' as UserRole);
      
      expect(viewers).toHaveLength(2);
      expect(viewers.every(user => user.role === 'Viewer')).toBe(true);
      expect(viewers.map(user => user.email)).toEqual([
        'viewer1@example.com',
        'viewer2@example.com'
      ]);
    });
  
    it('should return empty array when no users found for role', async () => {
      const nonexistentRole = await service.findByRole('NonExistent' as UserRole);
      
      expect(nonexistentRole).toHaveLength(0);
      expect(Array.isArray(nonexistentRole)).toBe(true);
    });
  
    it('should handle single user role correctly', async () => {
      const admins = await service.findByRole('Admin' as UserRole);
      
      expect(admins).toHaveLength(1);
      expect(admins[0].role).toBe('Admin');
      expect(admins[0].email).toBe('admin@example.com');
    });
  
    it('should handle mixed case input role', async () => {
      const editors = await service.findByRole('eDiToR' as UserRole);
      
      expect(editors).toHaveLength(2);
      expect(editors.every(user => user.role === 'Editor')).toBe(true);
    });
  
    it('should handle empty user service', async () => {
      const emptyService = new UserService();
      const result = await emptyService.findByRole('Admin' as UserRole);
      
      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findByEmail', () => {
    it('should return the user when email matches', async () => {
      const result = await service.findByEmail('editor1@example.com');
      expect(result).not.toBeNull();
      expect(result?.email).toBe('editor1@example.com');
      expect(result?.name).toBe('Editor One');
      expect(result?.role).toBe('Editor');
    });

    it('should handle case-sensitive email search', async () => {
      const result = await service.findByEmail('JANE@example.com');
      expect(result).toBeNull();
    });

    it('should return first matching user when multiple users have same email (edge case)', async () => {
      const duplicateUser = new User('Jane Smith', 'jane@example.com', 'user' as UserRole);
      // @ts-ignore - Accessing private property for testing
      service.items.set(duplicateUser.id, duplicateUser);

      const result = await service.findByEmail('jane@example.com');
      expect(result).not.toBeNull();
      expect(result?.email).toBe('jane@example.com');
      // Should return the first user with this email
      expect(result?.name).toBe('Jane Smith');
    });

    it('should handle empty email string', async () => {
      const result = await service.findByEmail('');
      expect(result).toBeNull();
    });

    it('should handle search in empty service', async () => {
      service = new UserService(); // Create new empty service
      const result = await service.findByEmail('jane@example.com');
      expect(result).toBeNull();
    });
  });
});