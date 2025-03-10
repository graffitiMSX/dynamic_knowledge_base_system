import { IBaseService } from '../interfaces/IBaseService';
import { IBaseEntity } from '../interfaces/IBaseEntity';

export abstract class BaseService<T extends IBaseEntity> implements IBaseService<T> {
  protected items: Map<string, T>;

  constructor() {
    this.items = new Map<string, T>();
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const item = await this.createInstance(data);
    this.items.set(item.id, item);
    return item;
  }

  async findById(id: string): Promise<T | null> {
    return this.items.get(id) || null;
  }

  async findAll(skip: number = 0, limit: number = 10): Promise<T[]> {
    const allItems = Array.from(this.items.values());
    return allItems.slice(skip, skip + limit);
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const item = await this.findById(id);
    if (!item) return null;

    const updatedItem = this.updateInstance(item, data);
    this.items.set(id, updatedItem);
    return updatedItem;
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }

  async count(): Promise<number> {
    return this.items.size;
  }

  protected abstract createInstance(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  protected abstract updateInstance(item: T, data: Partial<T>): T;
}