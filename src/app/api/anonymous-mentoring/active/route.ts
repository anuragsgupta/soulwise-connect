import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { createResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return NextResponse.json(
        createResponse(false, "Authentication required"),
        { status: 401 }
      );
    }

    let activeSessions;

    if (user.userType === "STUDENT") {
      // Get active sessions for student
      // @ts-expect-error - Prisma model name uses snake_case
      activeSessions = await prisma.anonymous_mentor_sessions.findMany({
        where: {
          student_id: user.userId,
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
    } else if (user.userType === "FACULTY") {
      // Get active sessions for faculty
      // @ts-expect-error - Prisma model name uses snake_case
      activeSessions = await prisma.anonymous_mentor_sessions.findMany({
        where: {
          mentor_id: user.userId,
          status: "ACTIVE",
        },
        orderBy: {
          last_message_at: "desc",
        },
        take: 5,
      });
    } else {
      return NextResponse.json(
        createResponse(false, "Unauthorized access"),
        { status: 401 }
      );
    }

    return NextResponse.json(
      createResponse(true, "Active sessions retrieved", {
        sessions: activeSessions,
        count: activeSessions.length,
      })
    );
  } catch (error) {
    console.error("Active sessions check error:", error);
    return NextResponse.json(
      createResponse(false, "Failed to check active sessions"),
      { status: 500 }
    );
  }
}
