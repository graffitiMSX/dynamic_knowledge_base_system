import { BaseService } from '../BaseService';
import { IBaseEntity } from '../../interfaces/IBaseEntity';
import { describe, it, expect, beforeEach } from '@jest/globals';

// Create a concrete implementation for testing
interface TestEntity extends IBaseEntity {
  name: string;
}

class TestService extends BaseService<TestEntity> {
  private idCounter = 0;

  protected async createInstance(data: Omit<TestEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<TestEntity> {
    this.idCounter++;
    return {
      id: `test-id-${this.idCounter}`,
      name: data.name,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  protected updateInstance(item: TestEntity, data: Partial<TestEntity>): TestEntity {
    return { ...item, ...data, updatedAt: new Date() };
  }
}

describe('BaseService', () => {
  let service: TestService;

  beforeEach(() => {
    service = new TestService();
  });

  describe('count', () => {
    it('should return 0 for empty items map', async () => {
      const count = await service.count();
      expect(count).toBe(0);
    });

    it('should return correct count after adding items', async () => {
      await service.create({ name: 'Item 1' });
      await service.create({ name: 'Item 2' });
      await service.create({ name: 'Item 3' });

      const count = await service.count();
      expect(count).toBe(3);
    });

    it('should return updated count after deleting items', async () => {
      const item1 = await service.create({ name: 'Item 1' });
      await service.create({ name: 'Item 2' });
      
      await service.delete(item1.id);
      
      const count = await service.count();
      expect(count).toBe(1);
    });

    it('should handle large number of items', async () => {
      const itemCount = 1000;
      const promises = Array.from({ length: itemCount }, (_, i) => 
        service.create({ name: `Item ${i}` })
      );
      
      await Promise.all(promises);
      
      const count = await service.count();
      expect(count).toBe(itemCount);
    });

    it('should return correct count after clearing all items', async () => {
      await service.create({ name: 'Item 1' });
      await service.create({ name: 'Item 2' });
      
      // @ts-ignore - Accessing protected property for testing
      service.items.clear();
      
      const count = await service.count();
      expect(count).toBe(0);
    });
  });
});