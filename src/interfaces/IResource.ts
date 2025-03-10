import { IBaseEntity } from './IBaseEntity';

export type ResourceType = 'video' | 'article' | 'pdf';

export interface IResource extends IBaseEntity {
  topicId: string;
  url: string;
  description: string;
  type: ResourceType;
}