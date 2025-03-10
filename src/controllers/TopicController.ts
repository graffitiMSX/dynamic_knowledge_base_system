import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { Topic } from '../models/Topic';
import { TopicService } from '../services/TopicService';

export class TopicController extends BaseController<Topic> {
  constructor(private topicService: TopicService) {
    super(topicService);
  }

  async getHierarchy(req: Request, res: Response): Promise<void> {
    try {
      const { rootId } = req.query;
      const hierarchy = await this.topicService.getHierarchy(rootId as string);
      res.json(hierarchy);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async findPath(req: Request, res: Response): Promise<void> {
    try {
      const { startId, endId } = req.params;
      const path = await this.topicService.findPath(startId, endId);
      
      if (path.length === 0) {
        res.status(404).json({ error: 'No path found between topics' });
        return;
      }
      
      res.json(path);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getVersion(req: Request, res: Response): Promise<void> {
    try {
      const { id, version } = req.params;
      const topicVersion = await this.topicService.getVersion(id, parseInt(version));
      
      if (!topicVersion) {
        res.status(404).json({ error: 'Version not found' });
        return;
      }
      
      res.json(topicVersion);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getVersions(req: Request, res: Response): Promise<void> {
    try {
      const versions = await this.topicService.getVersions(req.params.id);
      res.json(versions);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
  
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
  
      const [items, total] = await Promise.all([
        this.topicService.findAll(skip, limit),
        this.topicService.count()
      ]);
  
      res.json({
        items,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}