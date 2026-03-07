/**
 * ResponseHelper - Standardized API responses
 */
export class ResponseHelper {
  static success(data, statusCode = 200) {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        success: true,
        data,
      }),
    };
  }

  static error(error, statusCode = 500) {
    console.error('Error:', error);
    
    return {
      statusCode: error.statusCode || statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: error.code || 'INTERNAL_ERROR',
        },
      }),
    };
  }

  static paginated(data, pagination) {
    return this.success({
      items: data,
      pagination,
    });
  }

  static unauthorized(message = 'Unauthorized') {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        success: false,
        error: {
          message,
          code: 'UNAUTHORIZED',
        },
      }),
    };
  }

  static forbidden(message = 'Forbidden') {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        success: false,
        error: {
          message,
          code: 'FORBIDDEN',
        },
      }),
    };
  }

  static badRequest(message = 'Bad Request') {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        success: false,
        error: {
          message,
          code: 'BAD_REQUEST',
        },
      }),
    };
  }

  static notFound(message = 'Not Found') {
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        success: false,
        error: {
          message,
          code: 'NOT_FOUND',
        },
      }),
    };
  }
}
