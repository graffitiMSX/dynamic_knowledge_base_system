import { BaseModel } from './BaseModel';
import { ITopic } from '../interfaces/ITopic';

export class Topic extends BaseModel implements ITopic {
  name: string;
  content: string;
  version: number;
  parentTopicId?: string;

  constructor(name: string, content: string, parentTopicId?: string) {
    super();
    this.name = name;
    this.content = content;
    this.version = 1;
    this.parentTopicId = parentTopicId;
  }

  updateContent(content: string): void {
    this.content = content;
    this.version++;
    this.update();
  }

  updateName(name: string): void {
    this.name = name;
    this.update();
  }

  setParentTopic(parentTopicId: string | undefined): void {
    this.parentTopicId = parentTopicId;
    this.update();
  }
}