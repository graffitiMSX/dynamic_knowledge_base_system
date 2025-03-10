import { IBaseEntity } from './IBaseEntity';

export type UserRole = 'Admin' | 'Editor' | 'Viewer';

export interface IUser extends IBaseEntity {
  name: string;
  email: string;
  role: UserRole;
}