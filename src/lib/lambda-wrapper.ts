/**
 * Lambda Handler Wrapper for Next.js API Routes
 * 
 * This creates Lambda-compatible handlers from Next.js API route handlers
 */

/**
 * Wrap Next.js API route handler for Lambda
 */
export function createLambdaHandler(routeHandler: any) {
  return async (event: any, context: any) => {
    try {
      // Parse Lambda event into Next.js Request format
      const request = {
        method: event.httpMethod || event.requestContext?.http?.method || 'GET',
        headers: event.headers || {},
        body: event.body ? (event.isBase64Encoded ? 
          Buffer.from(event.body, 'base64').toString() : 
          event.body) : null,
        query: event.queryStringParameters || {},
        url: event.path || event.rawPath || '/',
      };

      // Create mock Response object
      let responseData: any = {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        body: '',
      };

      // Create Next.js compatible Request
      const req = new Request(
        `https://${event.headers?.host || 'localhost'}${request.url}`,
        {
          method: request.method,
          headers: new Headers(request.headers),
          body: request.body ? request.body : undefined,
        }
      );

      // Call the Next.js route handler
      const response = await routeHandler(req, context);

      // Convert Next.js Response to Lambda response
      if (response) {
        responseData.statusCode = response.status || 200;
        
        // Merge headers
        if (response.headers) {
          response.headers.forEach((value: string, key: string) => {
            responseData.headers[key] = value;
          });
        }

        // Get response body
        const body = await response.text();
        responseData.body = body;
      }

      return responseData;

    } catch (error) {
      console.error('Lambda handler error:', error);
      
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
      };
    }
  };
}

/**
 * Handle OPTIONS requests for CORS
 */
export function handleCORS(event: any) {
  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }
  return null;
}
