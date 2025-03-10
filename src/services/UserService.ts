import { BaseService } from './BaseService';
import { User } from '../models/User';
import { UserRole } from '../interfaces/IUser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export class UserService extends BaseService<User> {
  private refreshTokens: Set<string> = new Set();
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private readonly JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

  protected async createInstance(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<User> {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    return new User(data.name, data.email, data.role);
  }

  protected updateInstance(user: User, data: Partial<User>): User {
    if (data.name || data.email) {
      user.updateProfile(data.name || user.name, data.email || user.email);
    }
    if (data.role) {
      user.updateRole(data.role as UserRole);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = Array.from(this.items.values());
    return users.find((user) => user.email === email) || null;
  }

  async findByRole(role: UserRole): Promise<User[]> {
    const normalizedRole =
      role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    return Array.from(this.items.values()).filter(
      (user) => user.role === normalizedRole
    );
  }

  async authenticate(email: string, password: string): Promise<AuthResult> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(password, user.password ?? '');
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    this.refreshTokens.add(refreshToken);

    // Create a new User instance to maintain methods
    const userWithoutPassword = new User(user.name, user.email, user.role);
    userWithoutPassword.id = user.id;
    userWithoutPassword.createdAt = user.createdAt;
    userWithoutPassword.updatedAt = user.updatedAt;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    if (!this.refreshTokens.has(refreshToken)) {
      throw new Error('Invalid refresh token');
    }
    this.refreshTokens.delete(refreshToken);
  }

  async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (!this.refreshTokens.has(refreshToken)) {
      throw new Error('Invalid refresh token');
    }

    try {
      const payload = jwt.verify(
        refreshToken,
        this.JWT_REFRESH_SECRET
      ) as TokenPayload;
      const user = await this.findById(payload.userId);

      if (!user) {
        throw new Error('User not found');
      }

      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      this.refreshTokens.delete(refreshToken);
      this.refreshTokens.add(newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      this.refreshTokens.delete(refreshToken);
      throw new Error('Invalid refresh token');
    }
  }

  private generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: '15m' });
  }

  private generateRefreshToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, this.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  }
}
