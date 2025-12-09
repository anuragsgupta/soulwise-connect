import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { createResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/anonymous-mentoring/sessions - Get sessions (student or faculty)
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, "Authentication required"),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let where: any = {};

    if (user.userType === "STUDENT") {
      where.student_id = user.userId;
    } else if (user.userType === "FACULTY") {
      where.mentor_id = user.userId;
    } else {
      return NextResponse.json(createResponse(false, "Invalid user type"), {
        status: 403,
      });
    }

    if (status) {
      where.status = status;
    }

    const sessions = await prisma.anonymous_mentor_sessions.findMany({
      where,
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            facultyType: true,
            jobTitle: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
        anonymous_mentor_messages: {
          select: {
            id: true,
            created_at: true,
          },
          orderBy: {
            created_at: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            anonymous_mentor_messages: true,
          },
        },
      },
      orderBy: {
        last_message_at: "desc",
      },
    });

    // For faculty, hide student identity
    const sanitizedSessions = sessions.map((session) => {
      if (user.userType === "FACULTY") {
        return {
          ...session,
          student_id: undefined,
        };
      }
      return session;
    });

    return NextResponse.json(
      createResponse(true, "Sessions retrieved", {
        sessions: sanitizedSessions,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(createResponse(false, "Internal server error"), {
      status: 500,
    });
  }
}
