import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { createResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

// POST /api/anonymous-mentoring/requests/[requestId]/accept - Faculty accepts request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;

    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, "Authentication required"),
        { status: 401 }
      );
    }

    // Only faculty can accept requests
    if (user.userType !== "FACULTY") {
      return NextResponse.json(
        createResponse(false, "Only faculty can accept requests"),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { responseMessage } = body;

    // Get request details
    const requestData = await prisma.anonymous_mentor_requests.findUnique({
      where: { id: requestId },
      include: {
        students: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!requestData) {
      return NextResponse.json(createResponse(false, "Request not found"), {
        status: 404,
      });
    }

    // Verify this request is for this faculty
    if (requestData.mentor_id !== user.userId) {
      return NextResponse.json(createResponse(false, "Unauthorized access"), {
        status: 403,
      });
    }

    // Check if already accepted or declined
    if (requestData.status !== "PENDING") {
      return NextResponse.json(
        createResponse(
          false,
          `Request already ${requestData.status.toLowerCase()}`
        ),
        { status: 400 }
      );
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update request status
      const updatedRequest = await tx.anonymous_mentor_requests.update({
        where: { id: requestId },
        data: {
          status: "ACCEPTED",
          response_message: responseMessage || "Request accepted",
          responded_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Create active session
      const session = await tx.anonymous_mentor_sessions.create({
        data: {
          id: randomUUID(),
          student_id: requestData.student_id,
          mentor_id: user.userId,
          student_alias: requestData.anonymous_name,
          status: "ACTIVE",
          risk_level: "NORMAL",
          created_at: new Date(),
          updated_at: new Date(),
          last_message_at: new Date(),
        },
      });

      // Create notification for student
      await tx.notification.create({
        data: {
          id: randomUUID(),
          title: "Anonymous Request Accepted",
          message: `Your anonymous session request has been accepted. You can now chat anonymously.`,
          type: "GENERAL",
          recipientType: "STUDENT",
          studentRecipientId: requestData.student_id,
          relatedId: session.id,
          relatedType: "ANONYMOUS_MENTOR_SESSION",
          actionUrl: `/student/anonymous-mentoring/chat/${session.id}`,
          isRead: false,
          createdAt: new Date(),
        },
      });

      return { updatedRequest, session };
    });

    return NextResponse.json(
      createResponse(true, "Request accepted successfully", result),
      { status: 200 }
    );
  } catch (error) {
    console.error("Accept request error:", error);
    return NextResponse.json(createResponse(false, "Internal server error"), {
      status: 500,
    });
  }
}
