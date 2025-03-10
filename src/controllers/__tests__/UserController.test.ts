import { Request, Response } from 'express';
import { UserController } from '../UserController';
import { UserService } from '../../services/UserService';
import { User } from '../../models/User';

describe('UserController - login', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Setup mocks
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    userService = {
      authenticate: jest.fn()
    } as unknown as jest.Mocked<UserService>;

    mockRequest = {
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    };

    mockResponse = {
      json: jsonMock,
      status: statusMock
    } as Partial<Response>;

    userController = new UserController(userService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully authenticate user and return auth result', async () => {
    const mockAuthResult = {
      user: { id: '1', email: 'test@example.com', role: 'Admin' } as User,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    };

    // @ts-ignore
    userService.authenticate.mockResolvedValueOnce(mockAuthResult);

    await userController.login(mockRequest as Request, mockResponse as Response);

    expect(userService.authenticate).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(jsonMock).toHaveBeenCalledWith(mockAuthResult);
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('should handle authentication failure', async () => {
    const error = new Error('Invalid credentials');
    // @ts-ignore
    userService.authenticate.mockRejectedValueOnce(error);

    await userController.login(mockRequest as Request, mockResponse as Response);

    expect(userService.authenticate).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
  });

  it('should handle missing credentials', async () => {
    mockRequest.body = {};
    const error = new Error('Email and password are required');
    // @ts-ignore
    userService.authenticate.mockRejectedValueOnce(error);

    await userController.login(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Email and password are required' });
  });

  it('should handle unexpected errors', async () => {
    const error = new Error('Database connection failed');
    // @ts-ignore
    userService.authenticate.mockRejectedValueOnce(error);

    await userController.login(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Database connection failed' });
  });
});

describe('UserController - logout', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Setup mocks
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    userService = {
      logout: jest.fn()
    } as unknown as jest.Mocked<UserService>;

    mockRequest = {
      body: {
        refreshToken: 'valid-refresh-token'
      }
    };

    mockResponse = {
      json: jsonMock,
      status: statusMock
    } as Partial<Response>;

    userController = new UserController(userService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully logout user', async () => {
    // @ts-ignore
    userService.logout.mockResolvedValueOnce(undefined);

    await userController.logout(mockRequest as Request, mockResponse as Response);

    expect(userService.logout).toHaveBeenCalledWith('valid-refresh-token');
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Logged out successfully' });
  });

  it('should handle missing refresh token', async () => {
    mockRequest.body = {};
    const error = new Error('Refresh token is required');
    // @ts-ignore
    userService.logout.mockRejectedValueOnce(error);

    await userController.logout(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Refresh token is required' });
  });

  it('should handle invalid refresh token', async () => {
    const error = new Error('Invalid refresh token');
    // @ts-ignore
    userService.logout.mockRejectedValueOnce(error);

    await userController.logout(mockRequest as Request, mockResponse as Response);

    expect(userService.logout).toHaveBeenCalledWith('valid-refresh-token');
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid refresh token' });
  });

  it('should handle unexpected errors', async () => {
    const error = new Error('Database error');
    // @ts-ignore
    userService.logout.mockRejectedValueOnce(error);

    await userController.logout(mockRequest as Request, mockResponse as Response);

    expect(userService.logout).toHaveBeenCalledWith('valid-refresh-token');
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Database error' });
  });
});

describe('UserController - refreshToken', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Setup mocks
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      body: {
        refreshToken: 'valid-refresh-token'
      }
    };

    mockResponse = {
      json: jsonMock,
      status: statusMock
    } as Partial<Response>;

    // Create mocked UserService
    userService = {
      refreshToken: jest.fn()
    } as unknown as jest.Mocked<UserService>;

    userController = new UserController(userService);
  });

  it('should successfully refresh token and return new tokens', async () => {
    const mockTokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token'
    };

    // @ts-ignore
    userService.refreshToken.mockResolvedValueOnce(mockTokens);

    await userController.refreshToken(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(userService.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
    expect(jsonMock).toHaveBeenCalledWith(mockTokens);
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('should handle invalid refresh token error', async () => {
    const error = new Error('Invalid refresh token');
    // @ts-ignore
    userService.refreshToken.mockRejectedValueOnce(error);

    await userController.refreshToken(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(userService.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid refresh token' });
  });

  it('should handle missing refresh token', async () => {
    mockRequest.body = {};

    const error = new Error('Refresh token is required');
    // @ts-ignore
    userService.refreshToken.mockRejectedValueOnce(error);

    await userController.refreshToken(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Refresh token is required' });
  });

  it('should handle unexpected errors', async () => {
    const error = new Error('Unexpected error');
    // @ts-ignore
    userService.refreshToken.mockRejectedValueOnce(error);

    await userController.refreshToken(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Unexpected error' });
  });
});