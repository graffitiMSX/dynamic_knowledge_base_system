import { Request, Response, NextFunction } from 'express';
import { validateEmail } from '../validation';
import { describe, it, expect, jest } from '@jest/globals';

describe('validateEmail middleware', () => {
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

  it('should pass valid email from body', () => {
    mockRequest.body = { email: 'test@example.com' };
    
    const middleware = validateEmail();
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });

  it('should pass valid email from params', () => {
    mockRequest.params = { email: 'test@example.com' };
    
    const middleware = validateEmail();
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });

  it('should reject missing email', () => {
    const middleware = validateEmail();
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid email format' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should reject invalid email format', () => {
    mockRequest.body = { email: 'invalid-email' };
    
    const middleware = validateEmail();
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid email format' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should reject email without domain', () => {
    mockRequest.body = { email: 'test@' };
    
    const middleware = validateEmail();
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid email format' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should reject email with spaces', () => {
    mockRequest.body = { email: 'test @ example.com' };
    
    const middleware = validateEmail();
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid email format' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should prioritize body email over params email', () => {
    mockRequest.body = { email: 'body@example.com' };
    mockRequest.params = { email: 'params@example.com' };
    
    const middleware = validateEmail();
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });
});