// /app/api/community-memory/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  createCommunityPost,
  createCommunityReply,
  getCommunityItems,
  getCommunityItemsByInstitute,
  flagCommunityItem,
  hideCommunityItem,
  updateCommunityPost,
  updateCommunityReply,
  deleteCommunityPost,
  deleteCommunityReply,
} from "@/lib/dynamodb/communityMemory";
import {
  CommunityPostInput,
  CommunityReplyInput,
  CommunityPostDB,
  CommunityReplyDB,
} from "@/lib/dynamodb/schema";
import { moderateContentBasic, getModerationSummary } from "@/lib/contentModeration";
import {
  canCreatePost,
  canCreateReply,
  recordPost,
  recordReply,
} from "@/lib/rateLimiter";

function mapPostToDTO(post: CommunityPostDB, includeAuthorId = false) {
  const dto: any = {
    id: post.id,
    title: post.title,
    content: post.content,
    author: post.isAnonymous ? "Anonymous User" : post.author, // ✅ Mask author if anonymous
    authorId: post.authorId, // ✅ Always include for frontend ownership checks
    category: post.category,
    likes: post.likes,
    repliesCount: post.repliesCount,
    isAnonymous: post.isAnonymous,
    timestamp: post.createdAt,
    createdAt: post.createdAt,
    imageUrl: post.imageUrl,
    voiceNoteUrl: post.voiceNoteUrl,
    voiceNoteDuration: post.voiceNoteDuration,
  };

  // ⚠️ ONLY include sensitive admin data for admin requests
  if (includeAuthorId) {
    dto.ipAddress = post.ipAddress;
    dto.userAgent = post.userAgent;
    dto.isFlagged = post.isFlagged;
    dto.flagReason = post.flagReason;
    dto.isHidden = post.isHidden;
  }

  return dto;
}

function mapReplyToDTO(reply: CommunityReplyDB, includeAuthorId = false) {
  const dto: any = {
    id: reply.id,
    postId: reply.postId,
    content: reply.content,
    author: reply.isAnonymous ? "Anonymous User" : reply.author, // ✅ Mask author if anonymous
    authorId: reply.authorId, // ✅ Always include for frontend ownership checks
    likes: reply.likes,
    isAnonymous: reply.isAnonymous,
    timestamp: reply.createdAt,
    createdAt: reply.createdAt,
    imageUrl: reply.imageUrl,
    voiceNoteUrl: reply.voiceNoteUrl,
    voiceNoteDuration: reply.voiceNoteDuration,
  };

  // ⚠️ ONLY include sensitive admin data for admin requests
  if (includeAuthorId) {
    dto.ipAddress = reply.ipAddress;
    dto.userAgent = reply.userAgent;
    dto.isFlagged = reply.isFlagged;
    dto.flagReason = reply.flagReason;
    dto.isHidden = reply.isHidden;
  }

  return dto;
}

// ────────────────────────────
// GET: load posts + replies
// ────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const instituteId = searchParams.get("instituteId");

    let items;
    
    // Filter by institute if provided
    if (instituteId) {
      items = await getCommunityItemsByInstitute(instituteId, limit);
    } else {
      items = await getCommunityItems(limit);
    }

    const posts: CommunityPostDB[] = [];
    const replies: CommunityReplyDB[] = [];

    for (const item of items) {
      if (item.type === "post") posts.push(item as CommunityPostDB);
      else if (item.type === "reply") replies.push(item as CommunityReplyDB);
    }

    // Optional: sort newest → oldest by createdAt
    posts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    replies.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    // ✅ Filter out hidden items for regular users (not admins)
    const visiblePosts = posts.filter(p => !p.isHidden);
    const visibleReplies = replies.filter(r => !r.isHidden);

    return NextResponse.json({
      posts: visiblePosts.map(p => mapPostToDTO(p, false)),
      replies: visibleReplies.map(r => mapReplyToDTO(r, false)),
    });
  } catch (error: any) {
    console.error("GET /api/community-memory error:", error);
    return NextResponse.json(
      {
        error: "Failed to load community data",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

// ────────────────────────────
// POST: create post or reply
// ────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body as { type?: "post" | "reply" };

    if (type === "post") {
      const payload = body as CommunityPostInput;

      if (
        !payload.title?.trim() ||
        !payload.content?.trim() ||
        !payload.authorId ||
        !payload.author ||
        !payload.instituteId
      ) {
        return NextResponse.json(
          {
            error:
              "title, content, authorId, author and instituteId are required to create a post",
          },
          { status: 400 }
        );
      }

      // ✅ CHECK RATE LIMIT
      const rateLimitCheck = canCreatePost(payload.authorId);
      if (!rateLimitCheck.allowed) {
        return NextResponse.json(
          {
            error: rateLimitCheck.reason,
            retryAfter: rateLimitCheck.retryAfter,
          },
          { status: 429 } // Too Many Requests
        );
      }

      // ✅ MODERATE CONTENT
      const contentToModerate = `${payload.title}\n${payload.content}`;
      const moderationResult = await moderateContentBasic(contentToModerate);
      
      console.log('Content Moderation:', {
        authorId: payload.authorId,
        isAnonymous: payload.isAnonymous,
        summary: getModerationSummary(moderationResult),
      });

      // Auto-flag if needed
      if (moderationResult.shouldAutoFlag) {
        payload.isFlagged = true;
        payload.flagReason = `Auto-flagged: ${getModerationSummary(moderationResult)}`;
      }

      // Auto-hide if critical
      if (moderationResult.shouldAutoHide) {
        payload.isHidden = true;
      }

      // Save the post
      const saved = await createCommunityPost(payload);

      // If auto-flagged or hidden, perform additional actions
      if (moderationResult.shouldAutoFlag) {
        await flagCommunityItem(saved.id, moderationResult.flagReason || 'Inappropriate content detected', 'system');
        
        // TODO: Send alert to admins
        console.warn('⚠️ Post auto-flagged:', {
          id: saved.id,
          authorId: payload.authorId,
          reason: moderationResult.flagReason,
          toxicityScore: moderationResult.toxicityScore,
        });
      }

      if (moderationResult.shouldAutoHide) {
        await hideCommunityItem(saved.id, 'system');
        
        // TODO: Send urgent alert to admins
        console.error('🚨 Post auto-hidden:', {
          id: saved.id,
          authorId: payload.authorId,
          reason: moderationResult.flagReason,
          toxicityScore: moderationResult.toxicityScore,
        });
      }

      // ✅ RECORD POST FOR RATE LIMITING
      recordPost(payload.authorId);

      return NextResponse.json({
        post: mapPostToDTO(saved, false), // Don't expose authorId to frontend
        moderation: {
          flagged: moderationResult.shouldAutoFlag,
          hidden: moderationResult.shouldAutoHide,
        },
      });
    }

    if (type === "reply") {
      const payload = body as CommunityReplyInput;

      if (
        !payload.postId ||
        !payload.content?.trim() ||
        !payload.authorId ||
        !payload.author ||
        !payload.instituteId
      ) {
        return NextResponse.json(
          {
            error:
              "postId, content, authorId, author and instituteId are required to create a reply",
          },
          { status: 400 }
        );
      }

      // ✅ CHECK RATE LIMIT
      const rateLimitCheck = canCreateReply(payload.authorId);
      if (!rateLimitCheck.allowed) {
        return NextResponse.json(
          {
            error: rateLimitCheck.reason,
            retryAfter: rateLimitCheck.retryAfter,
          },
          { status: 429 }
        );
      }

      // ✅ MODERATE CONTENT
      const moderationResult = await moderateContentBasic(payload.content);
      
      console.log('Reply Moderation:', {
        authorId: payload.authorId,
        postId: payload.postId,
        summary: getModerationSummary(moderationResult),
      });

      if (moderationResult.shouldAutoFlag) {
        payload.isFlagged = true;
        payload.flagReason = `Auto-flagged: ${getModerationSummary(moderationResult)}`;
      }

      if (moderationResult.shouldAutoHide) {
        payload.isHidden = true;
      }

      const saved = await createCommunityReply(payload);

      if (moderationResult.shouldAutoFlag) {
        await flagCommunityItem(saved.id, moderationResult.flagReason || 'Inappropriate content detected', 'system');
        console.warn('⚠️ Reply auto-flagged:', {
          id: saved.id,
          postId: payload.postId,
          authorId: payload.authorId,
          reason: moderationResult.flagReason,
        });
      }

      if (moderationResult.shouldAutoHide) {
        await hideCommunityItem(saved.id, 'system');
        console.error('🚨 Reply auto-hidden:', {
          id: saved.id,
          postId: payload.postId,
          authorId: payload.authorId,
          reason: moderationResult.flagReason,
        });
      }

      // ✅ RECORD REPLY FOR RATE LIMITING
      recordReply(payload.authorId);

      return NextResponse.json({
        reply: mapReplyToDTO(saved, false), // Don't expose authorId to frontend
        moderation: {
          flagged: moderationResult.shouldAutoFlag,
          hidden: moderationResult.shouldAutoHide,
        },
      });
    }

    return NextResponse.json(
      { error: "Invalid type. Use 'post' or 'reply'." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("POST /api/community-memory error:", error);
    return NextResponse.json(
      {
        error: "Failed to save community data",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

// ────────────────────────────
// PATCH: update post or reply
// ────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, authorId } = body as { 
      type?: "post" | "reply"; 
      id: string; 
      authorId: string; 
    };

    if (!id || !authorId) {
      return NextResponse.json(
        { error: "id and authorId are required" },
        { status: 400 }
      );
    }

    if (type === "post") {
      const { title, content, category } = body as {
        title?: string;
        content?: string;
        category?: string;
      };

      if (!title && !content && !category) {
        return NextResponse.json(
          { error: "At least one field (title, content, category) must be provided for update" },
          { status: 400 }
        );
      }

      const updated = await updateCommunityPost(id, authorId, { title, content, category });

      if (!updated) {
        return NextResponse.json(
          { error: "Failed to update post. Either post not found or unauthorized." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        post: mapPostToDTO(updated, false),
      });
    }

    if (type === "reply") {
      const { content } = body as { content: string };

      if (!content?.trim()) {
        return NextResponse.json(
          { error: "content is required to update a reply" },
          { status: 400 }
        );
      }

      const updated = await updateCommunityReply(id, authorId, content);

      if (!updated) {
        return NextResponse.json(
          { error: "Failed to update reply. Either reply not found or unauthorized." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        reply: mapReplyToDTO(updated, false),
      });
    }

    return NextResponse.json(
      { error: "Invalid type. Use 'post' or 'reply'." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("PATCH /api/community-memory error:", error);
    return NextResponse.json(
      {
        error: "Failed to update community data",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

// ────────────────────────────
// DELETE: delete post or reply
// ────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "post" | "reply" | null;
    const id = searchParams.get("id");
    const authorId = searchParams.get("authorId");

    if (!id || !authorId || !type) {
      return NextResponse.json(
        { error: "type, id, and authorId are required" },
        { status: 400 }
      );
    }

    if (type === "post") {
      const success = await deleteCommunityPost(id, authorId);

      if (!success) {
        return NextResponse.json(
          { error: "Failed to delete post. Either post not found or unauthorized." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Post deleted successfully",
      });
    }

    if (type === "reply") {
      const success = await deleteCommunityReply(id, authorId);

      if (!success) {
        return NextResponse.json(
          { error: "Failed to delete reply. Either reply not found or unauthorized." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Reply deleted successfully",
      });
    }

    return NextResponse.json(
      { error: "Invalid type. Use 'post' or 'reply'." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("DELETE /api/community-memory error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete community data",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}