import { BaseService } from './BaseService';
import { Resource } from '../models/Resource';
import { ResourceType } from '../interfaces/IResource';

export class ResourceService extends BaseService<Resource> {
  protected async createInstance(data: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resource> {
    return new Resource(
      data.topicId,
      data.url,
      data.description,
      data.type as ResourceType
    );
  }

  protected updateInstance(resource: Resource, data: Partial<Resource>): Resource {
    if (data.url || data.description || data.type) {
      resource.updateDetails(
        data.url || resource.url,
        data.description || resource.description,
        data.type as ResourceType || resource.type
      );
    }
    if (data.topicId) {
      resource.updateTopic(data.topicId);
    }
    return resource;
  }

  async findByTopicId(topicId: string): Promise<Resource[]> {
    return Array.from(this.items.values()).filter(
      resource => resource.topicId === topicId
    );
  }

  async findByType(type: ResourceType): Promise<Resource[]> {
    return Array.from(this.items.values()).filter(
      resource => resource.type === type
    );
  }
}