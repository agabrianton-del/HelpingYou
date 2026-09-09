import { ApiError, errorHandler } from '@/middleware/errorHandler';

function createResponse() {
  const res: Record<string, any> = {};

  res.status = jest.fn().mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn().mockImplementation((payload: unknown) => payload);

  return res;
}

describe('errorHandler', () => {
  it('hides internal messages for unexpected server errors', () => {
    const req = {
      path: '/api/private',
      method: 'GET',
    };
    const res = createResponse();

    errorHandler(new Error('database password leaked'), req as never, res as never, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal Server Error',
      },
    });
  });

  it('preserves safe client-facing ApiError messages', () => {
    const req = {
      path: '/api/private',
      method: 'POST',
    };
    const res = createResponse();

    errorHandler(new ApiError(400, 'Invalid input', 'VALIDATION_ERROR'), req as never, res as never, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
      },
    });
  });
});
