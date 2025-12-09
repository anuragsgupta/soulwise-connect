import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { createResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

// POST /api/anonymous-mentoring/requests/[requestId]/decline - Faculty declines request
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

    // Only faculty can decline requests
    if (user.userType !== "FACULTY") {
      return NextResponse.json(
        createResponse(false, "Only faculty can decline requests"),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reason } = body;

    // Get request details
    const requestData = await prisma.anonymous_mentor_requests.findUnique({
      where: { id: requestId },
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

    // Update request status
    const updatedRequest = await prisma.anonymous_mentor_requests.update({
      where: { id: requestId },
      data: {
        status: "DECLINED",
        response_message: reason || "Request declined",
        responded_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Create notification for student
    await prisma.notification.create({
      data: {
        id: randomUUID(),
        title: "Anonymous Request Declined",
        message: `Your anonymous session request was declined. ${
          reason || "Please try reaching out to another mentor."
        }`,
        type: "GENERAL",
        recipientType: "STUDENT",
        studentRecipientId: requestData.student_id,
        relatedId: requestData.id,
        relatedType: "ANONYMOUS_MENTOR_REQUEST",
        actionUrl: "/student/anonymous-mentoring",
        isRead: false,
        createdAt: new Date(),
      },
    });

    return NextResponse.json(
      createResponse(true, "Request declined", { request: updatedRequest }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Decline request error:", error);
    return NextResponse.json(createResponse(false, "Internal server error"), {
      status: 500,
    });
  }
}
