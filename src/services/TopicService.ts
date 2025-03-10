import { BaseService } from './BaseService';
import { Topic } from '../models/Topic';
import { ITopic } from '../interfaces/ITopic';
import { TopicHierarchyService } from './TopicHierarchyService';

interface TopicVersion extends ITopic {
  originalTopicId: string;
}

export class TopicService extends BaseService<Topic> {
  private versions: Map<string, TopicVersion[]>;
  private hierarchyService: TopicHierarchyService;

  constructor() {
    super();
    this.versions = new Map<string, TopicVersion[]>();
    this.hierarchyService = new TopicHierarchyService(this.items);
  }

  async getHierarchy(rootTopicId?: string) {
    return this.hierarchyService.buildHierarchy(rootTopicId);
  }

  async findPath(startTopicId: string, endTopicId: string) {
    return this.hierarchyService.findShortestPath(startTopicId, endTopicId);
  }
  protected async createInstance(data: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>): Promise<Topic> {
    return new Topic(data.name, data.content, data.parentTopicId);
  }

  protected updateInstance(topic: Topic, data: Partial<Topic>): Topic {
    if (data.content) {
      this.saveVersion(topic);
      topic.updateContent(data.content);
    }
    if (data.name) {
      topic.updateName(data.name);
    }
    if ('parentTopicId' in data) {
      topic.setParentTopic(data.parentTopicId);
    }
    return topic;
  }

  private saveVersion(topic: Topic): void {
    const versions = this.versions.get(topic.id) || [];
    const version: TopicVersion = {
      ...topic,
      originalTopicId: topic.id
    };
    versions.push(version);
    this.versions.set(topic.id, versions);
  }

  async getVersions(topicId: string): Promise<TopicVersion[]> {
    return this.versions.get(topicId) || [];
  }

  async getVersion(topicId: string, version: number): Promise<TopicVersion | null> {
    const versions = await this.getVersions(topicId);
    return versions[version - 1] || null;
  }
}