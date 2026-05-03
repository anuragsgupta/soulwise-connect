/**
 * Lambda Handler for Chat Memory API
 * 
 * This wraps the Next.js chat-memory route for AWS Lambda
 */

import { GET, POST, DELETE } from '../src/app/api/chat-memory/route';
import { createLambdaHandler, handleCORS } from '../src/lib/lambda-wrapper';

export const handler = async (event: any, context: any) => {
  // Handle CORS preflight
  const corsResponse = handleCORS(event);
  if (corsResponse) return corsResponse;

  // Route to appropriate handler based on HTTP method
  const method = event.httpMethod || event.requestContext?.http?.method;
  
  let routeHandler;
  switch (method) {
    case 'GET':
      routeHandler = GET;
      break;
    case 'POST':
      routeHandler = POST;
      break;
    case 'DELETE':
      routeHandler = DELETE;
      break;
    default:
      return {
        statusCode: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
  }

  // Wrap Next.js handler for Lambda
  const lambdaHandler = createLambdaHandler(routeHandler);
  return lambdaHandler(event, context);
};
