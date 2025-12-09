import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let activeSessions;

    if (decoded.role === "STUDENT") {
      // Get active sessions for student
      // @ts-expect-error - Prisma model name uses snake_case
      activeSessions = await prisma.anonymous_mentor_sessions.findMany({
        where: {
          student_id: decoded.id,
          status: "ACTIVE",
        },
        include: {
          faculty: {
            select: {
              id: true,
              name: true,
              department: {
                select: {
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
        orderBy: {
          last_message_at: "desc",
        },
        take: 5,
      });
    } else if (decoded.role === "FACULTY") {
      // Get active sessions for faculty
      // @ts-expect-error - Prisma model name uses snake_case
      activeSessions = await prisma.anonymous_mentor_sessions.findMany({
        where: {
          mentor_id: decoded.id,
          status: "ACTIVE",
        },
        orderBy: {
          last_message_at: "desc",
        },
        take: 5,
      });
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: {
        sessions: activeSessions,
        count: activeSessions.length,
      },
    });
  } catch (error) {
    console.error("Active sessions check error:", error);
    return NextResponse.json(
      { error: "Failed to check active sessions" },
      { status: 500 }
    );
  }
}
