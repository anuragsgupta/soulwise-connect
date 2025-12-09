import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { createResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

// GET /api/anonymous-mentoring/sessions/[sessionId]/messages - Get messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, "Authentication required"),
        { status: 401 }
      );
    }

    // Verify session exists and user has access
    // @ts-expect-error - Prisma model name uses snake_case
    const session = await prisma.anonymous_mentor_sessions.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        student_id: true,
        mentor_id: true,
        status: true,
      },
    });

    if (!session) {
      return NextResponse.json(createResponse(false, "Session not found"), {
        status: 404,
      });
    }

    // Verify ownership
    if (user.userType === "STUDENT" && session.student_id !== user.userId) {
      return NextResponse.json(createResponse(false, "Unauthorized access"), {
        status: 403,
      });
    }

    if (user.userType === "FACULTY" && session.mentor_id !== user.userId) {
      return NextResponse.json(createResponse(false, "Unauthorized access"), {
        status: 403,
      });
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const before = searchParams.get("before"); // Cursor for pagination

    const where: any = {
      session_id: sessionId,
    };

    if (before) {
      where.created_at = {
        lt: new Date(before),
      };
    }

    // @ts-expect-error - Prisma model name uses snake_case
    const messages = await prisma.anonymous_mentor_messages.findMany({
      where,
      orderBy: {
        created_at: "desc",
      },
      take: limit,
    });

    // Reverse to show oldest first
    messages.reverse();

    // If student and session is ended, return empty messages
    // (simulate clearing from student's view)
    if (user.userType === "STUDENT" && session.status === "ENDED") {
      return NextResponse.json(
        createResponse(true, "Messages retrieved", { messages: [] }),
        { status: 200 }
      );
    }

    return NextResponse.json(
      createResponse(true, "Messages retrieved", { messages }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(createResponse(false, "Internal server error"), {
      status: 500,
    });
  }
}

// POST /api/anonymous-mentoring/sessions/[sessionId]/messages - Send message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, "Authentication required"),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { messageText } = body;

    // Validate message
    if (!messageText || typeof messageText !== "string") {
      return NextResponse.json(
        createResponse(false, "Message text is required"),
        { status: 400 }
      );
    }

    if (messageText.length > 1000) {
      return NextResponse.json(
        createResponse(false, "Message too long (max 1000 characters)"),
        { status: 400 }
      );
    }

    // Verify session exists and user has access
    // @ts-expect-error - Prisma model name uses snake_case
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

    // Check if session is active
    if (session.status !== "ACTIVE") {
      return NextResponse.json(createResponse(false, "Session is not active"), {
        status: 400,
      });
    }

    // Verify ownership
    let senderRole: "STUDENT" | "MENTOR";
    let recipientId: string;

    if (user.userType === "STUDENT" && session.student_id === user.userId) {
      senderRole = "STUDENT";
      recipientId = session.mentor_id;
    } else if (
      user.userType === "FACULTY" &&
      session.mentor_id === user.userId
    ) {
      senderRole = "MENTOR";
      recipientId = session.student_id;
    } else {
      return NextResponse.json(createResponse(false, "Unauthorized access"), {
        status: 403,
      });
    }

    // Basic sentiment analysis (detect crisis keywords)
    const crisisKeywords = [
      "suicide",
      "kill myself",
      "end my life",
      "want to die",
      "no reason to live",
    ];
    const highRiskKeywords = [
      "depressed",
      "hopeless",
      "worthless",
      "give up",
      "cant go on",
    ];

    let riskScore = 0;
    let sentimentLabel = "neutral";
    let detectedRiskLevel = session.risk_level || "NORMAL";

    const lowerMessage = messageText.toLowerCase();

    if (crisisKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      riskScore = 1.0;
      sentimentLabel = "crisis";
      detectedRiskLevel = "CRISIS";
    } else if (
      highRiskKeywords.some((keyword) => lowerMessage.includes(keyword))
    ) {
      riskScore = 0.7;
      sentimentLabel = "negative";
      detectedRiskLevel = "HIGH";
    } else if (
      lowerMessage.includes("anxious") ||
      lowerMessage.includes("worried") ||
      lowerMessage.includes("stressed")
    ) {
      riskScore = 0.4;
      sentimentLabel = "concerned";
      detectedRiskLevel = "MODERATE";
    }

    // Create message and update session in transaction
    const result = await prisma.$transaction(async (tx) => {
      // @ts-expect-error - Prisma model name uses snake_case
      const message = await tx.anonymous_mentor_messages.create({
        data: {
          id: randomUUID(),
          session_id: sessionId,
          sender_role: senderRole,
          message_text: messageText,
          sentiment_label: sentimentLabel,
          risk_score: riskScore,
          emotion_tags: [],
          is_read: false,
          created_at: new Date(),
        },
      });

      // Update session
      // @ts-expect-error - Prisma model name uses snake_case
      const updatedSession = await tx.anonymous_mentor_sessions.update({
        where: { id: sessionId },
        data: {
          last_message_at: new Date(),
          updated_at: new Date(),
          risk_level: detectedRiskLevel,
        },
      });

      // Create notification for recipient
      if (senderRole === "STUDENT") {
        await tx.notification.create({
          data: {
            id: randomUUID(),
            title: "New Anonymous Message",
            message: `${session.student_alias} sent you a message`,
            type: "GENERAL",
            recipientType: "FACULTY",
            facultyRecipientId: recipientId,
            relatedId: sessionId,
            relatedType: "ANONYMOUS_MENTOR_SESSION",
            actionUrl: `/faculty/anonymous-mentoring/chat/${sessionId}`,
            isRead: false,
            createdAt: new Date(),
          },
        });
      } else {
        await tx.notification.create({
          data: {
            id: randomUUID(),
            title: "New Message from Mentor",
            message: "You have a new message in your anonymous chat",
            type: "GENERAL",
            recipientType: "STUDENT",
            studentRecipientId: recipientId,
            relatedId: sessionId,
            relatedType: "ANONYMOUS_MENTOR_SESSION",
            actionUrl: `/student/anonymous-mentoring/chat/${sessionId}`,
            isRead: false,
            createdAt: new Date(),
          },
        });
      }

      // If crisis detected, create additional alert notification
      if (detectedRiskLevel === "CRISIS" || detectedRiskLevel === "HIGH") {
        await tx.notification.create({
          data: {
            id: randomUUID(),
            title: `${detectedRiskLevel} RISK Detected`,
            message: `${detectedRiskLevel} risk message detected in anonymous chat with ${session.student_alias}`,
            type: "CRISIS_ALERT",
            recipientType: "FACULTY",
            facultyRecipientId: session.mentor_id,
            relatedId: sessionId,
            relatedType: "ANONYMOUS_MENTOR_SESSION",
            actionUrl: `/faculty/anonymous-mentoring/chat/${sessionId}`,
            isRead: false,
            createdAt: new Date(),
          },
        });
      }

      return { message, updatedSession };
    });

    return NextResponse.json(
      createResponse(true, "Message sent", {
        message: result.message,
        riskLevel: detectedRiskLevel,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(createResponse(false, "Internal server error"), {
      status: 500,
    });
  }
}
