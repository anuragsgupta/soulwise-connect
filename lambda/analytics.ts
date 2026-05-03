/**
 * Lambda Handler for Analytics API
 * 
 * This wraps the Next.js analytics route for AWS Lambda
 */

import { POST } from '../src/app/api/analytics/route';
import { createLambdaHandler, handleCORS } from '../src/lib/lambda-wrapper';

export const handler = async (event: any, context: any) => {
  // Handle CORS preflight
  const corsResponse = handleCORS(event);
  if (corsResponse) return corsResponse;

  // Wrap Next.js handler for Lambda
  const lambdaHandler = createLambdaHandler(POST);
  return lambdaHandler(event, context);
};
