import { TopicHierarchyService } from '../TopicHierarchyService';
import { Topic } from '../../models/Topic';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('TopicHierarchyService', () => {
  let service: TopicHierarchyService;
  let topics: Map<string, Topic>;

  beforeEach(() => {
    topics = new Map<string, Topic>();
    
    // Create test topics
    const topic1 = new Topic('Topic 1', 'Content 1');
    const topic2 = new Topic('Topic 2', 'Content 2');
    const topic3 = new Topic('Topic 3', 'Content 3');
    const topic4 = new Topic('Topic 4', 'Content 4');
    const topic5 = new Topic('Topic 5', 'Content 5');

    // Set up relationships
    topic2.setParentTopic(topic1.id);
    topic3.setParentTopic(topic2.id);
    topic4.setParentTopic(topic2.id);
    topic5.setParentTopic(topic4.id);

    // Add topics to map
    topics.set(topic1.id, topic1);
    topics.set(topic2.id, topic2);
    topics.set(topic3.id, topic3);
    topics.set(topic4.id, topic4);
    topics.set(topic5.id, topic5);

    service = new TopicHierarchyService(topics);
  });

  describe('findShortestPath', () => {
    it('should return empty array when start topic does not exist', () => {
      const result = service.findShortestPath('non-existent', 'any-id');
      expect(result).toEqual([]);
    });

    it('should return empty array when no path exists between topics', () => {
      const newTopic = new Topic('Isolated Topic', 'Content');
      topics.set(newTopic.id, newTopic);
      
      const existingTopicId = Array.from(topics.values())[0].id;
      const result = service.findShortestPath(existingTopicId, newTopic.id);
      
      expect(result).toEqual([]);
    });

    it('should find direct path between parent and child', () => {
      const topic1 = Array.from(topics.values())[0];
      const topic2 = Array.from(topics.values())[1];
      
      const result = service.findShortestPath(topic1.id, topic2.id);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(topic1.id);
      expect(result[1].id).toBe(topic2.id);
    });

    it('should find path between siblings through parent', () => {
      const topic3 = Array.from(topics.values())[2];
      const topic4 = Array.from(topics.values())[3];
      const topic2 = Array.from(topics.values())[1]; // Get parent topic
      
      const result = service.findShortestPath(topic3.id, topic4.id);
      
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(topic3.id);
      expect(result[1].id).toBe(topic2.id); // Check parent is in the middle
      expect(result[2].id).toBe(topic4.id);
    });

    it('should find path through multiple levels', () => {
      const topic1 = Array.from(topics.values())[0];
      const topic5 = Array.from(topics.values())[4];
      
      const result = service.findShortestPath(topic1.id, topic5.id);
      
      expect(result.length).toBeGreaterThan(1);
      expect(result[0].id).toBe(topic1.id);
      expect(result[result.length - 1].id).toBe(topic5.id);
    });

    it('should handle circular references', () => {
      const topic1 = Array.from(topics.values())[0];
      const topic5 = Array.from(topics.values())[4];
      
      // Create circular reference
      topic1.setParentTopic(topic5.id);
      
      const result = service.findShortestPath(topic1.id, topic5.id);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].id).toBe(topic1.id);
      expect(result[result.length - 1].id).toBe(topic5.id);
    });

    it('should return single topic array when start and end are same', () => {
      const topic1 = Array.from(topics.values())[0];
      
      const result = service.findShortestPath(topic1.id, topic1.id);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(topic1.id);
    });
  });
});