import { ResourceService } from '../ResourceService';
import { Resource } from '../../models/Resource';
import { ResourceType } from '../../interfaces/IResource';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('ResourceService', () => {
  let service: ResourceService;
  let resources: Resource[];

  beforeEach(() => {
    service = new ResourceService();
    resources = [
      new Resource('topic1', 'https://video1.com', 'Video 1', 'video'),
      new Resource('topic1', 'https://article1.com', 'Article 1', 'article'),
      new Resource('topic2', 'https://video2.com', 'Video 2', 'video'),
      new Resource('topic2', 'https://pdf1.com', 'PDF 1', 'pdf'),
      new Resource('topic3', 'https://article2.com', 'Article 2', 'article')
    ];

    // Add resources to service
    resources.forEach(resource => {
      // @ts-ignore - Accessing private property for testing
      service.items.set(resource.id, resource);
    });
  });

  describe('findByType', () => {
    it('should return empty array when no resources match the type', async () => {
      const result = await service.findByType('unknown' as ResourceType);
      expect(result).toEqual([]);
    });

    it('should return all resources of video type', async () => {
      const result = await service.findByType('video');
      expect(result).toHaveLength(2);
      expect(result.every(r => r.type === 'video')).toBe(true);
      expect(result.map(r => r.url)).toContain('https://video1.com');
      expect(result.map(r => r.url)).toContain('https://video2.com');
    });

    it('should return all resources of article type', async () => {
      const result = await service.findByType('article');
      expect(result).toHaveLength(2);
      expect(result.every(r => r.type === 'article')).toBe(true);
      expect(result.map(r => r.url)).toContain('https://article1.com');
      expect(result.map(r => r.url)).toContain('https://article2.com');
    });

    it('should return all resources of pdf type', async () => {
      const result = await service.findByType('pdf');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('pdf');
      expect(result[0].url).toBe('https://pdf1.com');
    });

    it('should handle case when items map is empty', async () => {
      service = new ResourceService(); // Create new empty service
      const result = await service.findByType('video');
      expect(result).toEqual([]);
    });
  });
});