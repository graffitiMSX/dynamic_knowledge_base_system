import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { Resource } from '../models/Resource';
import { ResourceService } from '../services/ResourceService';

export class ResourceController extends BaseController<Resource> {
  constructor(private resourceService: ResourceService) {
    super(resourceService);
  }

  async getByTopicId(req: Request, res: Response): Promise<void> {
    try {
      const { topicId } = req.params;
      const resources = await this.resourceService.findByTopicId(topicId);
      res.json(resources);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}