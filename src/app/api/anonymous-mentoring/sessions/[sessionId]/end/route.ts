import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { createResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

// POST /api/anonymous-mentoring/sessions/[sessionId]/end - End session
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, "Authentication required"),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { endedBy } = body;

    // Verify session exists and user has access
    const session = await prisma.anonymous_mentor_sessions.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        student_id: true,
        mentor_id: true,
        status: true,
        student_alias: true,
      },
    });

    if (!session) {
      return NextResponse.json(createResponse(false, "Session not found"), {
        status: 404,
      });
    }

    // Check if already ended
    if (session.status === "ENDED") {
      return NextResponse.json(createResponse(false, "Session already ended"), {
        status: 400,
      });
    }

    // Verify ownership
    let isStudent = false;
    let isFaculty = false;

    if (user.userType === "STUDENT" && session.student_id === user.userId) {
      isStudent = true;
    } else if (
      user.userType === "FACULTY" &&
      session.mentor_id === user.userId
    ) {
      isFaculty = true;
    } else {
      return NextResponse.json(createResponse(false, "Unauthorized access"), {
        status: 403,
      });
    }

    // Update session status
    const updatedSession = await prisma.anonymous_mentor_sessions.update({
      where: { id: sessionId },
      data: {
        status: "ENDED",
        ended_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Create notification for the other party
    if (isStudent) {
      // Student ended - notify faculty
      await prisma.notification.create({
        data: {
          id: randomUUID(),
          title: "Anonymous Session Ended",
          message: `${session.student_alias} has ended the anonymous chat session`,
          type: "GENERAL",
          recipientType: "FACULTY",
          facultyRecipientId: session.mentor_id,
          relatedId: sessionId,
          relatedType: "ANONYMOUS_MENTOR_SESSION",
          actionUrl: `/faculty/anonymous-mentoring/sessions`,
          isRead: false,
          createdAt: new Date(),
        },
      });
    } else if (isFaculty) {
      // Faculty ended - notify student
      await prisma.notification.create({
        data: {
          id: randomUUID(),
          title: "Session Ended by Mentor",
          message: "Your anonymous chat session has been ended by the mentor",
          type: "GENERAL",
          recipientType: "STUDENT",
          studentRecipientId: session.student_id,
          relatedId: sessionId,
          relatedType: "ANONYMOUS_MENTOR_SESSION",
          actionUrl: `/student/anonymous-mentoring`,
          isRead: false,
          createdAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      createResponse(true, "Session ended successfully", {
        session: updatedSession,
        endedBy: isStudent ? "STUDENT" : "FACULTY",
        messagesCleared: isStudent, // Only cleared for student view
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("End session error:", error);
    return NextResponse.json(createResponse(false, "Internal server error"), {
      status: 500,
    });
  }
}
