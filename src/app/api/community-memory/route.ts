// /app/api/community-memory/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  createCommunityPost,
  createCommunityReply,
  getCommunityItems,
} from "@/lib/dynamodb/communityMemory";
import {
  CommunityPostInput,
  CommunityReplyInput,
  CommunityPostDB,
  CommunityReplyDB,
} from "@/lib/dynamodb/schema";

function mapPostToDTO(post: CommunityPostDB) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    authorId: post.authorId,
    author: post.author,
    category: post.category,
    likes: post.likes,
    repliesCount: post.repliesCount,
    isAnonymous: post.isAnonymous,
    timestamp: post.createdAt,  // frontend uses timestamp || createdAt
    createdAt: post.createdAt,
  };
}

function mapReplyToDTO(reply: CommunityReplyDB) {
  return {
    id: reply.id,
    postId: reply.postId,
    content: reply.content,
    authorId: reply.authorId,
    author: reply.author,
    likes: reply.likes,
    isAnonymous: reply.isAnonymous,
    timestamp: reply.createdAt,
    createdAt: reply.createdAt,
  };
}

// ────────────────────────────
// GET: load posts + replies
// ────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const items = await getCommunityItems(limit);

    const posts: CommunityPostDB[] = [];
    const replies: CommunityReplyDB[] = [];

    for (const item of items) {
      if (item.type === "post") posts.push(item as CommunityPostDB);
      else if (item.type === "reply") replies.push(item as CommunityReplyDB);
    }

    // Optional: sort newest → oldest by createdAt
    posts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    replies.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    return NextResponse.json({
      posts: posts.map(mapPostToDTO),
      replies: replies.map(mapReplyToDTO),
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
        !payload.author
      ) {
        return NextResponse.json(
          {
            error:
              "title, content, authorId and author are required to create a post",
          },
          { status: 400 }
        );
      }

      const saved = await createCommunityPost(payload);
      return NextResponse.json({
        post: mapPostToDTO(saved),
      });
    }

    if (type === "reply") {
      const payload = body as CommunityReplyInput;

      if (
        !payload.postId ||
        !payload.content?.trim() ||
        !payload.authorId ||
        !payload.author
      ) {
        return NextResponse.json(
          {
            error:
              "postId, content, authorId and author are required to create a reply",
          },
          { status: 400 }
        );
      }

      const saved = await createCommunityReply(payload);
      return NextResponse.json({
        reply: mapReplyToDTO(saved),
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
