import { BaseModel } from './BaseModel';
import { IResource, ResourceType } from '../interfaces/IResource';

export class Resource extends BaseModel implements IResource {
  topicId: string;
  url: string;
  description: string;
  type: ResourceType;

  constructor(topicId: string, url: string, description: string, type: ResourceType) {
    super();
    this.topicId = topicId;
    this.url = url;
    this.description = description;
    this.type = type;
  }

  updateDetails(url: string, description: string, type: ResourceType): void {
    this.url = url;
    this.description = description;
    this.type = type;
    this.update();
  }

  updateTopic(topicId: string): void {
    this.topicId = topicId;
    this.update();
  }
}