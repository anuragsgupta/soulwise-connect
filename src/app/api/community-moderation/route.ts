// /app/api/community-moderation/route.ts
// ⚠️ ADMIN ONLY ENDPOINT - Must check authentication/authorization
import { NextRequest, NextResponse } from "next/server";
import {
  getCommunityItemsForAdmin,
  getFlaggedItems,
  flagCommunityItem,
  hideCommunityItem,
  unhideCommunityItem,
} from "@/lib/dynamodb/communityMemory";
import {
  CommunityPostDB,
  CommunityReplyDB,
} from "@/lib/dynamodb/schema";

/**
 * ⚠️ TODO: Add proper authentication middleware
 * This should verify the user is an admin/moderator before allowing access
 * Example: Check JWT token, session, or role-based permissions
 */
function isAdmin(request: NextRequest): boolean {
  // TODO: Implement real admin check
  // For now, you can check headers, cookies, or session
  const authHeader = request.headers.get("authorization");
  
  // Example: Check for admin token
  // return authHeader === `Bearer ${process.env.ADMIN_SECRET_TOKEN}`;
  
  // ⚠️ TEMPORARY: Return true for testing - REMOVE IN PRODUCTION
  console.warn("⚠️ Admin check not implemented - allowing all requests for testing");
  return true;
}

// ────────────────────────────
// GET: Get all items with full details for admin review
// ────────────────────────────
export async function GET(request: NextRequest) {
  try {
    // ⚠️ Check if user is admin
    if (!isAdmin(request)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    // Get flagged items only
    if (action === "flagged") {
      const items = await getFlaggedItems(limit);
      const posts: CommunityPostDB[] = [];
      const replies: CommunityReplyDB[] = [];

      for (const item of items) {
        if (item.type === "post") posts.push(item as CommunityPostDB);
        else if (item.type === "reply") replies.push(item as CommunityReplyDB);
      }

      return NextResponse.json({
        posts,
        replies,
        total: items.length,
      });
    }

    // Get all items with full details (including authorId, IP, etc.)
    const items = await getCommunityItemsForAdmin(limit);
    const posts: CommunityPostDB[] = [];
    const replies: CommunityReplyDB[] = [];

    for (const item of items) {
      if (item.type === "post") posts.push(item as CommunityPostDB);
      else if (item.type === "reply") replies.push(item as CommunityReplyDB);
    }

    posts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    replies.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    return NextResponse.json({
      posts,
      replies,
      total: items.length,
      flaggedCount: items.filter((i) => i.isFlagged).length,
      hiddenCount: items.filter((i) => i.isHidden).length,
    });
  } catch (error: any) {
    console.error("GET /api/community-moderation error:", error);
    return NextResponse.json(
      {
        error: "Failed to load moderation data",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

// ────────────────────────────
// POST: Flag, hide, or unhide content
// ────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // ⚠️ Check if user is admin
    if (!isAdmin(request)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, itemId, reason, moderatorId } = body;

    if (!itemId || !moderatorId) {
      return NextResponse.json(
        { error: "itemId and moderatorId are required" },
        { status: 400 }
      );
    }

    let success = false;

    switch (action) {
      case "flag":
        if (!reason) {
          return NextResponse.json(
            { error: "reason is required for flagging" },
            { status: 400 }
          );
        }
        success = await flagCommunityItem(itemId, reason, moderatorId);
        break;

      case "hide":
        success = await hideCommunityItem(itemId, moderatorId);
        break;

      case "unhide":
        success = await unhideCommunityItem(itemId, moderatorId);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action. Use 'flag', 'hide', or 'unhide'" },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Item ${action}ed successfully`,
        itemId,
      });
    } else {
      return NextResponse.json(
        { error: `Failed to ${action} item` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("POST /api/community-moderation error:", error);
    return NextResponse.json(
      {
        error: "Failed to moderate content",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
