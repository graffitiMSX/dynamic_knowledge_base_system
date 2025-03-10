import { BaseModel } from './BaseModel';
import { IUser, UserRole } from '../interfaces/IUser';

export class User extends BaseModel implements IUser {
  name: string;
  email: string;
  role: UserRole;
  password?: string;

  constructor(name: string, email: string, role: UserRole = 'Viewer') {
    super();
    this.name = name;
    this.email = email;
    this.role = role;
  }

  updateProfile(name: string, email: string, password?: string): void {
    this.name = name;
    this.email = email;
    if (password) {
      this.password = password;
    }
    this.update();
  }

  updateRole(role: UserRole): void {
    this.role = role;
    this.update();
  }
}