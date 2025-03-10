import { IBaseEntity } from './IBaseEntity';

export interface ITopic extends IBaseEntity {
  name: string;
  content: string;
  version: number;
  parentTopicId?: string;
}