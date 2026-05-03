// /lib/dynamodb/client.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const REGION = process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION;

if (!REGION) {
  throw new Error("NEXT_PUBLIC_AWS_REGION or AWS_REGION is not set in .env");
}

if (!process.env.DYNAMODB_CHAT_MEMORY_TABLE) {
  throw new Error("DYNAMODB_CHAT_MEMORY_TABLE is not set in .env");
}

if (!process.env.DYNAMODB_COMMUNITY_TABLE) {
  throw new Error("DYNAMODB_COMMUNITY_TABLE is not set in .env");
}

const ACCESS_KEY_ID = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

// It creates the DynamoDB Client with AWS credentials
const baseClient = new DynamoDBClient({
  region: REGION,
  credentials:
    ACCESS_KEY_ID && SECRET_ACCESS_KEY
      ? {
          accessKeyId: ACCESS_KEY_ID,
          secretAccessKey: SECRET_ACCESS_KEY,
        }
      : undefined,
});

export const dynamoClient = DynamoDBDocumentClient.from(baseClient, {
  marshallOptions: {
    convertClassInstanceToMap: true,
    removeUndefinedValues: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

// Existing chat table (for your chatbot memory)
export const CHAT_MEMORY_TABLE = process.env.DYNAMODB_CHAT_MEMORY_TABLE!;

// ⭐ New community table
export const COMMUNITY_TABLE = process.env.DYNAMODB_COMMUNITY_TABLE!;
