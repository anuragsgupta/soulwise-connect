// /lib/dynamodb/communityMemory.ts
import {
  PutCommand,
  UpdateCommand,
  ScanCommand,
  GetCommand,
  DeleteCommand,
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
    instituteId: input.instituteId,
    likes: 0,
    repliesCount: 0,
    createdAt,
    updatedAt: createdAt,
    imageUrl: input.imageUrl,
    voiceNoteUrl: input.voiceNoteUrl,
    voiceNoteDuration: input.voiceNoteDuration,
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
    instituteId: input.instituteId,
    likes: 0,
    createdAt,
    updatedAt: createdAt,
    imageUrl: input.imageUrl,
    voiceNoteUrl: input.voiceNoteUrl,
    voiceNoteDuration: input.voiceNoteDuration,
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

/**
 * ✅ ADMIN ONLY: Get all items including authorId for moderation
 * This should ONLY be called from admin endpoints with proper auth
 */
export async function getCommunityItemsForAdmin(limit = 100) {
  const res = await dynamoClient.send(
    new ScanCommand({
      TableName: COMMUNITY_TABLE,
      Limit: limit,
    })
  );

  const items = (res.Items || []) as (CommunityPostDB | CommunityReplyDB)[];
  // Return all fields including authorId, ipAddress for admin review
  return items;
}

/**
 * ✅ ADMIN ONLY: Flag a post or reply as inappropriate
 */
export async function flagCommunityItem(
  itemId: string,
  flagReason: string,
  moderatorId: string
): Promise<boolean> {
  try {
    await dynamoClient.send(
      new UpdateCommand({
        TableName: COMMUNITY_TABLE,
        Key: { id: itemId },
        UpdateExpression:
          "SET isFlagged = :flagged, flagReason = :reason, moderatorId = :modId, moderatedAt = :now",
        ExpressionAttributeValues: {
          ":flagged": true,
          ":reason": flagReason,
          ":modId": moderatorId,
          ":now": nowIso(),
        },
        ConditionExpression: "attribute_exists(id)",
      })
    );
    return true;
  } catch (error) {
    console.error("Failed to flag item:", error);
    return false;
  }
}

/**
 * ✅ ADMIN ONLY: Hide a post or reply from public view
 */
export async function hideCommunityItem(
  itemId: string,
  moderatorId: string
): Promise<boolean> {
  try {
    await dynamoClient.send(
      new UpdateCommand({
        TableName: COMMUNITY_TABLE,
        Key: { id: itemId },
        UpdateExpression:
          "SET isHidden = :hidden, moderatorId = :modId, moderatedAt = :now",
        ExpressionAttributeValues: {
          ":hidden": true,
          ":modId": moderatorId,
          ":now": nowIso(),
        },
        ConditionExpression: "attribute_exists(id)",
      })
    );
    return true;
  } catch (error) {
    console.error("Failed to hide item:", error);
    return false;
  }
}

/**
 * ✅ ADMIN ONLY: Unhide a previously hidden post or reply
 */
export async function unhideCommunityItem(
  itemId: string,
  moderatorId: string
): Promise<boolean> {
  try {
    await dynamoClient.send(
      new UpdateCommand({
        TableName: COMMUNITY_TABLE,
        Key: { id: itemId },
        UpdateExpression:
          "SET isHidden = :hidden, moderatorId = :modId, moderatedAt = :now",
        ExpressionAttributeValues: {
          ":hidden": false,
          ":modId": moderatorId,
          ":now": nowIso(),
        },
        ConditionExpression: "attribute_exists(id)",
      })
    );
    return true;
  } catch (error) {
    console.error("Failed to unhide item:", error);
    return false;
  }
}

/**
 * ✅ Get flagged items for admin review
 */
export async function getFlaggedItems(limit = 50) {
  const res = await dynamoClient.send(
    new ScanCommand({
      TableName: COMMUNITY_TABLE,
      FilterExpression: "isFlagged = :flagged",
      ExpressionAttributeValues: {
        ":flagged": true,
      },
      Limit: limit,
    })
  );

  const items = (res.Items || []) as (CommunityPostDB | CommunityReplyDB)[];
  return items;
}

/**
 * ✅ Get items filtered by institute
 */
export async function getCommunityItemsByInstitute(instituteId: string, limit = 50) {
  const res = await dynamoClient.send(
    new ScanCommand({
      TableName: COMMUNITY_TABLE,
      FilterExpression: "instituteId = :instituteId",
      ExpressionAttributeValues: {
        ":instituteId": instituteId,
      },
      Limit: limit,
    })
  );

  const items = (res.Items || []) as (CommunityPostDB | CommunityReplyDB)[];
  return items;
}

/**
 * ✅ Update a community post (edit functionality)
 * Only the author can edit their own post
 */
export async function updateCommunityPost(
  postId: string,
  authorId: string,
  updates: { title?: string; content?: string; category?: string }
): Promise<CommunityPostDB | null> {
  try {
    // First, verify the post exists and belongs to the author
    const getResult = await dynamoClient.send(
      new GetCommand({
        TableName: COMMUNITY_TABLE,
        Key: { id: postId },
      })
    );

    const existingPost = getResult.Item as CommunityPostDB | undefined;
    
    if (!existingPost || existingPost.type !== "post") {
      console.error("Post not found");
      return null;
    }

    if (existingPost.authorId !== authorId) {
      console.error("Unauthorized: Author mismatch");
      return null;
    }

    // Build update expression
    const updateParts: string[] = [];
    const expressionValues: Record<string, any> = {
      ":now": nowIso(),
    };

    if (updates.title !== undefined) {
      updateParts.push("title = :title");
      expressionValues[":title"] = updates.title;
    }
    if (updates.content !== undefined) {
      updateParts.push("content = :content");
      expressionValues[":content"] = updates.content;
    }
    if (updates.category !== undefined) {
      updateParts.push("category = :category");
      expressionValues[":category"] = updates.category;
    }
    
    updateParts.push("updatedAt = :now");

    const updateExpression = `SET ${updateParts.join(", ")}`;

    const result = await dynamoClient.send(
      new UpdateCommand({
        TableName: COMMUNITY_TABLE,
        Key: { id: postId },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionValues,
        ReturnValues: "ALL_NEW",
      })
    );

    return result.Attributes as CommunityPostDB;
  } catch (error) {
    console.error("Failed to update post:", error);
    return null;
  }
}

/**
 * ✅ Update a community reply (edit functionality)
 * Only the author can edit their own reply
 */
export async function updateCommunityReply(
  replyId: string,
  authorId: string,
  content: string
): Promise<CommunityReplyDB | null> {
  try {
    // First, verify the reply exists and belongs to the author
    const getResult = await dynamoClient.send(
      new GetCommand({
        TableName: COMMUNITY_TABLE,
        Key: { id: replyId },
      })
    );

    const existingReply = getResult.Item as CommunityReplyDB | undefined;
    
    if (!existingReply || existingReply.type !== "reply") {
      console.error("Reply not found");
      return null;
    }

    if (existingReply.authorId !== authorId) {
      console.error("Unauthorized: Author mismatch");
      return null;
    }

    const result = await dynamoClient.send(
      new UpdateCommand({
        TableName: COMMUNITY_TABLE,
        Key: { id: replyId },
        UpdateExpression: "SET content = :content, updatedAt = :now",
        ExpressionAttributeValues: {
          ":content": content,
          ":now": nowIso(),
        },
        ReturnValues: "ALL_NEW",
      })
    );

    return result.Attributes as CommunityReplyDB;
  } catch (error) {
    console.error("Failed to update reply:", error);
    return null;
  }
}

/**
 * ✅ Delete a community post
 * Only the author can delete their own post
 * Also decrements reply count if needed
 */
export async function deleteCommunityPost(
  postId: string,
  authorId: string
): Promise<boolean> {
  try {
    // First, verify the post exists and belongs to the author
    const getResult = await dynamoClient.send(
      new GetCommand({
        TableName: COMMUNITY_TABLE,
        Key: { id: postId },
      })
    );

    const existingPost = getResult.Item as CommunityPostDB | undefined;
    
    if (!existingPost || existingPost.type !== "post") {
      console.error("Post not found");
      return false;
    }

    if (existingPost.authorId !== authorId) {
      console.error("Unauthorized: Author mismatch");
      return false;
    }

    // Delete the post
    await dynamoClient.send(
      new DeleteCommand({
        TableName: COMMUNITY_TABLE,
        Key: { id: postId },
      })
    );

    // TODO: Optionally delete all replies to this post
    // For now, we'll leave replies orphaned (they won't show up anyway)

    return true;
  } catch (error) {
    console.error("Failed to delete post:", error);
    return false;
  }
}

/**
 * ✅ Delete a community reply
 * Only the author can delete their own reply
 * Also decrements reply count on parent post
 */
export async function deleteCommunityReply(
  replyId: string,
  authorId: string
): Promise<boolean> {
  try {
    // First, verify the reply exists and belongs to the author
    const getResult = await dynamoClient.send(
      new GetCommand({
        TableName: COMMUNITY_TABLE,
        Key: { id: replyId },
      })
    );

    const existingReply = getResult.Item as CommunityReplyDB | undefined;
    
    if (!existingReply || existingReply.type !== "reply") {
      console.error("Reply not found");
      return false;
    }

    if (existingReply.authorId !== authorId) {
      console.error("Unauthorized: Author mismatch");
      return false;
    }

    // Delete the reply
    await dynamoClient.send(
      new DeleteCommand({
        TableName: COMMUNITY_TABLE,
        Key: { id: replyId },
      })
    );

    // Decrement repliesCount on parent post (best-effort)
    try {
      await dynamoClient.send(
        new UpdateCommand({
          TableName: COMMUNITY_TABLE,
          Key: { id: existingReply.postId },
          UpdateExpression:
            "SET repliesCount = if_not_exists(repliesCount, :zero) - :dec, updatedAt = :now",
          ExpressionAttributeValues: {
            ":dec": 1,
            ":zero": 0,
            ":now": nowIso(),
          },
          ConditionExpression: "attribute_exists(id) AND #t = :postType AND repliesCount > :zero",
          ExpressionAttributeNames: {
            "#t": "type",
          },
        })
      );
    } catch {
      // Ignore if parent post not found or condition failed
    }

    return true;
  } catch (error) {
    console.error("Failed to delete reply:", error);
    return false;
  }
}

