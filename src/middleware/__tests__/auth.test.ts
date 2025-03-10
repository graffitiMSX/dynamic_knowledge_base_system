import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../auth';
import { UserRole } from '../../interfaces/IUser';
import { AuthRequest, checkRole } from '../auth';

jest.mock('jsonwebtoken');

describe('authenticateToken middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    mockRequest = {
      headers: {},
    };

    mockResponse = {
      json: jsonMock,
      status: statusMock,
    };

    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no token is provided', () => {
    authenticateToken(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Access token is required' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid_token',
    };

    // @ts-ignore
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authenticateToken(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should set user in request and call next() if token is valid', () => {
    const mockToken = 'valid_token';
    const mockDecodedToken = {
      userId: '123',
      email: 'test@example.com',
      role: 'Admin' as UserRole,
    };

    mockRequest.headers = {
      authorization: `Bearer ${mockToken}`,
    };

    // @ts-ignore
    jwt.verify.mockReturnValue(mockDecodedToken);

    authenticateToken(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(jwt.verify).toHaveBeenCalledWith(
      mockToken,
      process.env.JWT_SECRET || 'your-secret-key'
    );
    expect((mockRequest as any).user).toEqual({
      id: mockDecodedToken.userId,
      role: mockDecodedToken.role,
    });
    expect(nextFunction).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });

  it('should extract token correctly from Authorization header', () => {
    const mockToken = 'valid_token';
    mockRequest.headers = {
      authorization: `Bearer ${mockToken}`,
    };

    // @ts-ignore
    jwt.verify.mockReturnValue({
      userId: '123',
      email: 'test@example.com',
      role: 'Admin' as UserRole,
    });

    authenticateToken(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(jwt.verify).toHaveBeenCalledWith(
      mockToken,
      process.env.JWT_SECRET || 'your-secret-key'
    );
  });
});


describe('checkRole Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
    nextFunction = jest.fn();
  });

  it('should call next() when user has allowed role', () => {
    mockRequest = {
      user: {
        id: '123',
        role: 'Admin' as UserRole
      }
    };

    const middleware = checkRole(['Admin']);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });

  it('should return 401 when user is not present', () => {
    mockRequest = {};

    const middleware = checkRole(['Admin']);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 when user role is not allowed', () => {
    mockRequest = {
      user: {
        id: '123',
        role: 'Viewer' as UserRole
      }
    };

    const middleware = checkRole(['Admin']);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(403);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should allow multiple roles and pass if user has any of them', () => {
    mockRequest = {
      user: {
        id: '123',
        role: 'Editor' as UserRole
      }
    };

    const middleware = checkRole(['Admin', 'Editor']);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });
});