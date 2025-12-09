import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { createResponse } from "@/lib/auth";
import { generateUniqueAnonymousName } from "@/lib/anonymousNames";
import { prisma } from "@/lib/prisma";

// GET /api/anonymous-mentoring/names/generate - Generate unique anonymous name
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, "Authentication required"),
        { status: 401 }
      );
    }

    // Only students can generate anonymous names
    if (user.userType !== "STUDENT") {
      return NextResponse.json(
        createResponse(false, "Only students can generate anonymous names"),
        { status: 403 }
      );
    }

    // Get existing anonymous names from active sessions and pending requests
    const existingSessions = await prisma.anonymous_mentor_sessions.findMany({
      where: {
        OR: [{ student_id: user.userId }, { status: "ACTIVE" }],
      },
      select: {
        student_alias: true,
      },
    });

    const existingRequests = await prisma.anonymous_mentor_requests.findMany({
      where: {
        student_id: user.userId,
        status: "PENDING",
      },
      select: {
        anonymous_name: true,
      },
    });

    const existingNames = [
      ...existingSessions.map((s) => s.student_alias),
      ...existingRequests.map((r) => r.anonymous_name),
    ];

    const anonymousName = generateUniqueAnonymousName(existingNames);

    return NextResponse.json(
      createResponse(true, "Anonymous name generated", { anonymousName }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Generate anonymous name error:", error);
    return NextResponse.json(createResponse(false, "Internal server error"), {
      status: 500,
    });
  }
}
