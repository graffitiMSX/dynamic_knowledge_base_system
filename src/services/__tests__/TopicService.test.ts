import { TopicService } from '../TopicService';
import { TopicHierarchyService } from '../TopicHierarchyService';
import { Topic } from '../../models/Topic';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../TopicHierarchyService');
jest.mock('../../models/Topic');

describe('TopicService', () => {
  let service: TopicService;
  let mockTopic: Topic;

  beforeEach(() => {
    service = new TopicService();
    
    // Create mock topic
    mockTopic = new Topic('Test Topic', 'Original content');
    mockTopic.updateContent = jest.fn();
    mockTopic.updateName = jest.fn();
    mockTopic.setParentTopic = jest.fn();

    // Mock saveVersion method
    // @ts-ignore - Accessing private method for testing
    service.saveVersion = jest.fn();
  });

  describe('updateInstance', () => {
    it('should update content and save version when content is provided', () => {
      const newContent = 'New content';
      
      // @ts-ignore - Accessing protected method for testing
      service.updateInstance(mockTopic, { content: newContent });
  
      // @ts-ignore - Verify saveVersion was called
      expect(service.saveVersion).toHaveBeenCalledWith(mockTopic);
      expect(mockTopic.updateContent).toHaveBeenCalledWith(newContent);
      expect(mockTopic.updateName).not.toHaveBeenCalled();
      expect(mockTopic.setParentTopic).not.toHaveBeenCalled();
    });
  
    it('should update name without saving version when only name is provided', () => {
      const newName = 'New Name';
      
      // @ts-ignore - Accessing protected method for testing
      service.updateInstance(mockTopic, { name: newName });
  
      // @ts-ignore - Verify saveVersion was not called
      expect(service.saveVersion).not.toHaveBeenCalled();
      expect(mockTopic.updateName).toHaveBeenCalledWith(newName);
      expect(mockTopic.updateContent).not.toHaveBeenCalled();
      expect(mockTopic.setParentTopic).not.toHaveBeenCalled();
    });
  
    it('should update parentTopicId without saving version when only parentTopicId is provided', () => {
      const newParentId = 'new-parent-id';
      
      // @ts-ignore - Accessing protected method for testing
      service.updateInstance(mockTopic, { parentTopicId: newParentId });
  
      // @ts-ignore - Verify saveVersion was not called
      expect(service.saveVersion).not.toHaveBeenCalled();
      expect(mockTopic.setParentTopic).toHaveBeenCalledWith(newParentId);
      expect(mockTopic.updateContent).not.toHaveBeenCalled();
      expect(mockTopic.updateName).not.toHaveBeenCalled();
    });
  
    it('should update all fields when all data is provided', () => {
      const updateData = {
        name: 'New Name',
        content: 'New Content',
        parentTopicId: 'new-parent-id'
      };
      
      // @ts-ignore - Accessing protected method for testing
      service.updateInstance(mockTopic, updateData);
  
      // @ts-ignore - Verify all methods were called
      expect(service.saveVersion).toHaveBeenCalledWith(mockTopic);
      expect(mockTopic.updateContent).toHaveBeenCalledWith(updateData.content);
      expect(mockTopic.updateName).toHaveBeenCalledWith(updateData.name);
      expect(mockTopic.setParentTopic).toHaveBeenCalledWith(updateData.parentTopicId);
    });
  
    it('should not call any update methods when empty data is provided', () => {
      // @ts-ignore - Accessing protected method for testing
      service.updateInstance(mockTopic, {});
  
      // @ts-ignore - Verify no methods were called
      expect(service.saveVersion).not.toHaveBeenCalled();
      expect(mockTopic.updateContent).not.toHaveBeenCalled();
      expect(mockTopic.updateName).not.toHaveBeenCalled();
      expect(mockTopic.setParentTopic).not.toHaveBeenCalled();
    });
  
    it('should return the updated topic', () => {
      const updateData = { name: 'New Name' };
      
      // @ts-ignore - Accessing protected method for testing
      const result = service.updateInstance(mockTopic, updateData);
  
      expect(result).toBe(mockTopic);
    });
  });
});