import { Request, Response } from 'express';
import { TopicController } from '../TopicController';
import { TopicService } from '../../services/TopicService';
import { Topic } from '../../models/Topic';

describe('TopicController - getHierarchy', () => {
  let topicController: TopicController;
  let topicService: jest.Mocked<TopicService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Setup mocks
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    topicService = {
      getHierarchy: jest.fn()
    } as unknown as jest.Mocked<TopicService>;

    mockRequest = {
      query: {
        rootId: 'root-123'
      }
    };

    mockResponse = {
      json: jsonMock,
      status: statusMock
    } as Partial<Response>;

    topicController = new TopicController(topicService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully return topic hierarchy', async () => {
    const mockHierarchy = {
      id: 'root-123',
      title: 'Root Topic',
      children: [
        {
          id: 'child-1',
          title: 'Child Topic 1',
          children: []
        }
      ]
    };

    // @ts-ignore
    topicService.getHierarchy.mockResolvedValueOnce(mockHierarchy);

    await topicController.getHierarchy(mockRequest as Request, mockResponse as Response);

    expect(topicService.getHierarchy).toHaveBeenCalledWith('root-123');
    expect(jsonMock).toHaveBeenCalledWith(mockHierarchy);
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('should handle missing rootId', async () => {
    mockRequest.query = {};
    const error = new Error('Root ID is required');
    // @ts-ignore
    topicService.getHierarchy.mockRejectedValueOnce(error);

    await topicController.getHierarchy(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Root ID is required' });
  });

  it('should handle non-existent root topic', async () => {
    const error = new Error('Root topic not found');
    // @ts-ignore
    topicService.getHierarchy.mockRejectedValueOnce(error);

    await topicController.getHierarchy(mockRequest as Request, mockResponse as Response);

    expect(topicService.getHierarchy).toHaveBeenCalledWith('root-123');
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Root topic not found' });
  });

  it('should handle service errors', async () => {
    const error = new Error('Database error');
    // @ts-ignore
    topicService.getHierarchy.mockRejectedValueOnce(error);

    await topicController.getHierarchy(mockRequest as Request, mockResponse as Response);

    expect(topicService.getHierarchy).toHaveBeenCalledWith('root-123');
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Database error' });
  });
});

describe('TopicController - findPath', () => {
  let topicController: TopicController;
  let topicService: jest.Mocked<TopicService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Setup mocks
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    topicService = {
      findPath: jest.fn()
    } as unknown as jest.Mocked<TopicService>;

    mockRequest = {
      params: {
        startId: 'start-123',
        endId: 'end-456'
      }
    };

    mockResponse = {
      json: jsonMock,
      status: statusMock
    } as Partial<Response>;

    topicController = new TopicController(topicService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully return path between topics', async () => {
    const mockPath = [
      { id: 'start-123', title: 'Start Topic' },
      { id: 'middle-789', title: 'Middle Topic' },
      { id: 'end-456', title: 'End Topic' }
    ];

    // @ts-ignore
    topicService.findPath.mockResolvedValueOnce(mockPath);

    await topicController.findPath(mockRequest as Request, mockResponse as Response);

    expect(topicService.findPath).toHaveBeenCalledWith('start-123', 'end-456');
    expect(jsonMock).toHaveBeenCalledWith(mockPath);
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('should return 404 when no path is found', async () => {
    // @ts-ignore
    topicService.findPath.mockResolvedValueOnce([]);

    await topicController.findPath(mockRequest as Request, mockResponse as Response);

    expect(topicService.findPath).toHaveBeenCalledWith('start-123', 'end-456');
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'No path found between topics' });
  });

  it('should handle missing parameters', async () => {
    mockRequest.params = {};
    const error = new Error('Start and end IDs are required');
    // @ts-ignore
    topicService.findPath.mockRejectedValueOnce(error);

    await topicController.findPath(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Start and end IDs are required' });
  });

  it('should handle non-existent topics', async () => {
    const error = new Error('One or both topics not found');
    // @ts-ignore
    topicService.findPath.mockRejectedValueOnce(error);

    await topicController.findPath(mockRequest as Request, mockResponse as Response);

    expect(topicService.findPath).toHaveBeenCalledWith('start-123', 'end-456');
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'One or both topics not found' });
  });

  it('should handle service errors', async () => {
    const error = new Error('Database error');
    // @ts-ignore
    topicService.findPath.mockRejectedValueOnce(error);

    await topicController.findPath(mockRequest as Request, mockResponse as Response);

    expect(topicService.findPath).toHaveBeenCalledWith('start-123', 'end-456');
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Database error' });
  });
});
