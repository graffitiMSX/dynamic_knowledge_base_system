import { Request, Response, NextFunction } from 'express';
import { validateRole } from '../validation';
import { UserRole } from '../../interfaces/IUser';
import { describe, it, expect, jest } from '@jest/globals';

describe('validateRole middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    nextFunction = jest.fn() as NextFunction;

    mockRequest = {
      body: {},
      params: {}
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock
    } as Partial<Response>;
  });

  it('should pass valid role from body', () => {
    mockRequest.body = { role: 'Admin' };
    
    const middleware = validateRole();
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });

  it('should pass valid role from params', () => {
    mockRequest.params = { role: 'Editor' };
    
    const middleware = validateRole();
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });

  it('should reject missing role', () => {
    const middleware = validateRole();
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Invalid role. Role must be one of: Admin, Editor, Viewer'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should reject invalid role', () => {
    mockRequest.body = { role: 'SuperAdmin' };
    
    const middleware = validateRole();
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Invalid role. Role must be one of: Admin, Editor, Viewer'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should reject empty role string', () => {
    mockRequest.body = { role: '' };
    
    const middleware = validateRole();
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Invalid role. Role must be one of: Admin, Editor, Viewer'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should prioritize body role over params role', () => {
    mockRequest.body = { role: 'Admin' };
    mockRequest.params = { role: 'Editor' };
    
    const middleware = validateRole();
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });

  it('should validate all possible valid roles', () => {
    const validRoles: UserRole[] = ['Admin', 'Editor', 'Viewer'];
    
    validRoles.forEach(role => {
      mockRequest.body = { role };
      const middleware = validateRole();
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).not.toHaveBeenCalled();
      
      // Reset the mock calls for next iteration
      jest.clearAllMocks();
    });
  });
});