import { IBaseEntity } from '../interfaces/IBaseEntity';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseModel implements IBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  constructor() {
    this.id = uuidv4();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  protected update(): void {
    this.updatedAt = new Date();
  }
}