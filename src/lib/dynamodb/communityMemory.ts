// /lib/dynamodb/communityMemory.ts
import {
  PutCommand,
  UpdateCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoClient, COMMUNITY_TABLE } from "./client";
import {
  CommunityPostInput,
  CommunityReplyInput,
  CommunityPostDB,
  CommunityReplyDB,
} from "./schema";

function nowIso() {
  return new Date().toISOString();
}

function newId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

/**
 * Create a new post
 */
export async function createCommunityPost(
  input: CommunityPostInput
): Promise<CommunityPostDB> {
  const id = newId("post");
  const createdAt = nowIso();
  const item: CommunityPostDB = {
    id,
    type: "post",
    title: input.title,
    content: input.content,
    authorId: input.authorId,
    author: input.author,
    category: input.category || "General",
    isAnonymous: input.isAnonymous ?? true,
    likes: 0,
    repliesCount: 0,
    createdAt,
    updatedAt: createdAt,
  };

  await dynamoClient.send(
    new PutCommand({
      TableName: COMMUNITY_TABLE,
      Item: item,
    })
  );

  return item;
}

/**
 * Create a new reply and optionally increment repliesCount on parent post
 */
export async function createCommunityReply(
  input: CommunityReplyInput
): Promise<CommunityReplyDB> {
  const id = newId("reply");
  const createdAt = nowIso();
  const item: CommunityReplyDB = {
    id,
    type: "reply",
    postId: input.postId,
    content: input.content,
    authorId: input.authorId,
    author: input.author,
    isAnonymous: input.isAnonymous ?? true,
    likes: 0,
    createdAt,
    updatedAt: createdAt,
  };

  // Save reply
  await dynamoClient.send(
    new PutCommand({
      TableName: COMMUNITY_TABLE,
      Item: item,
    })
  );

  // Try to increment repliesCount on the parent post (best-effort)
  try {
    await dynamoClient.send(
      new UpdateCommand({
        TableName: COMMUNITY_TABLE,
        Key: { id: input.postId },
        UpdateExpression:
          "SET repliesCount = if_not_exists(repliesCount, :zero) + :inc, updatedAt = :now",
        ExpressionAttributeValues: {
          ":inc": 1,
          ":zero": 0,
          ":now": createdAt,
        },
        ConditionExpression: "attribute_exists(id) AND #t = :postType",
        ExpressionAttributeNames: {
          "#t": "type",
        },
      })
    );
  } catch {
    // Ignore if parent post not found or condition failed
  }

  return item;
}

/**
 * Get all items (posts + replies) up to a limit
 */
export async function getCommunityItems(limit = 50) {
  const res = await dynamoClient.send(
    new ScanCommand({
      TableName: COMMUNITY_TABLE,
      Limit: limit,
    })
  );

  const items = (res.Items || []) as (CommunityPostDB | CommunityReplyDB)[];
  return items;
}
