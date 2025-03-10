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

describe('TopicController - getAll', () => {
  let controller: TopicController;
  let mockTopicService: jest.Mocked<TopicService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    // Setup mock service
    mockTopicService = {
      findAll: jest.fn(),
      count: jest.fn(),
    } as unknown as jest.Mocked<TopicService>;

    // Setup mock response
    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnThis();
    mockResponse = {
      json: jsonSpy,
      status: statusSpy,
    };

    // Initialize controller
    controller = new TopicController(mockTopicService);
  });

  it('should return paginated topics with default values', async () => {
    // Setup
    const mockTopics = [
      new Topic('Topic 1', 'Content 1'),
      new Topic('Topic 2', 'Content 2')
    ];
    const totalCount = 15;
    
    mockRequest = { query: {} };
    mockTopicService.findAll.mockResolvedValue(mockTopics);
    mockTopicService.count.mockResolvedValue(totalCount);

    // Execute
    await controller.getAll(mockRequest as Request, mockResponse as Response);

    // Verify
    expect(mockTopicService.findAll).toHaveBeenCalledWith(0, 10);
    expect(mockTopicService.count).toHaveBeenCalled();
    expect(jsonSpy).toHaveBeenCalledWith({
      items: mockTopics,
      page: 1,
      limit: 10,
      total: totalCount,
      totalPages: 2
    });
  });

  it('should handle custom pagination parameters', async () => {
    // Setup
    const mockTopics = [new Topic('Topic 3', 'Content 3')];
    const totalCount = 30;
    
    mockRequest = { 
      query: { 
        page: '3',
        limit: '5'
      } 
    };
    mockTopicService.findAll.mockResolvedValue(mockTopics);
    mockTopicService.count.mockResolvedValue(totalCount);

    // Execute
    await controller.getAll(mockRequest as Request, mockResponse as Response);

    // Verify
    expect(mockTopicService.findAll).toHaveBeenCalledWith(10, 5);
    expect(jsonSpy).toHaveBeenCalledWith({
      items: mockTopics,
      page: 3,
      limit: 5,
      total: totalCount,
      totalPages: 6
    });
  });

  it('should handle invalid pagination parameters', async () => {
    // Setup
    const mockTopics: Topic[] = [];
    const totalCount = 0;
    
    mockRequest = { 
      query: { 
        page: 'invalid',
        limit: 'invalid'
      } 
    };
    mockTopicService.findAll.mockResolvedValue(mockTopics);
    mockTopicService.count.mockResolvedValue(totalCount);

    // Execute
    await controller.getAll(mockRequest as Request, mockResponse as Response);

    // Verify
    expect(mockTopicService.findAll).toHaveBeenCalledWith(0, 10);
    expect(jsonSpy).toHaveBeenCalledWith({
      items: mockTopics,
      page: 1,
      limit: 10,
      total: totalCount,
      totalPages: 0
    });
  });

  it('should handle service errors', async () => {
    // Setup
    const errorMessage = 'Database error';
    mockRequest = { query: {} };
    mockTopicService.findAll.mockRejectedValue(new Error(errorMessage));

    // Execute
    await controller.getAll(mockRequest as Request, mockResponse as Response);

    // Verify
    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: errorMessage });
  });

  it('should handle zero total results', async () => {
    // Setup
    mockRequest = { query: {} };
    mockTopicService.findAll.mockResolvedValue([]);
    mockTopicService.count.mockResolvedValue(0);

    // Execute
    await controller.getAll(mockRequest as Request, mockResponse as Response);

    // Verify
    expect(jsonSpy).toHaveBeenCalledWith({
      items: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    });
  });
});
