/**
 * Lambda Handler for Chatbot API
 * 
 * This wraps the Next.js chatbot route for AWS Lambda
 */

import { POST } from '../src/app/api/chatbot/route';
import { createLambdaHandler, handleCORS } from '../src/lib/lambda-wrapper';

export const handler = async (event: any, context: any) => {
  // Handle CORS preflight
  const corsResponse = handleCORS(event);
  if (corsResponse) return corsResponse;

  // Wrap Next.js handler for Lambda
  const lambdaHandler = createLambdaHandler(POST);
  return lambdaHandler(event, context);
};
