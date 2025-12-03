import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/middleware/auth';
import { createResponse } from '@/lib/auth';
import { generateSessionMeetLink, generateSimpleMeetLink } from '@/lib/googleMeetService';
import { sendSessionApprovalEmails } from '@/lib/emailService';

// GET /api/sessions/[id] - Get a specific session by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    const session = await prisma.sessionBooking.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            enrollmentId: true,
            rollNumber: true,
            currentSemester: true,
            phone: true,
            parentPhone: true,
            emergencyContactName: true,
            emergencyContactPhone: true,
            cgpa: true,
            admissionYear: true,
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            batch: {
              select: {
                id: true,
                name: true,
                startYear: true,
                endYear: true,
              },
            },
            mentor: {
              select: {
                id: true,
                name: true,
                email: true,
                jobTitle: true,
              },
            },
          },
        },
        faculty: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            jobTitle: true,
            facultyType: true,
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        createResponse(false, 'Session not found'),
        { status: 404 }
      );
    }

    // Verify access
    if (
      user.userType === 'STUDENT' && session.studentId !== user.userId ||
      user.userType === 'FACULTY' && session.facultyId !== user.userId
    ) {
      return NextResponse.json(
        createResponse(false, 'Unauthorized access to this session'),
        { status: 403 }
      );
    }

    return NextResponse.json(
      createResponse(true, 'Session retrieved successfully', { session }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  }
}

// PATCH /api/sessions/[id] - Update session status (approve/reject/reschedule/complete/cancel)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, facultyNotes, rejectionReason, scheduledDate, scheduledTime } = body;

    // Get the session
    const existingSession = await prisma.sessionBooking.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        faculty: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        createResponse(false, 'Session not found'),
        { status: 404 }
      );
    }

    // Verify access based on action
    if (action === 'approve' || action === 'reject' || action === 'reschedule') {
      // Only faculty can approve/reject/reschedule
      if (user.userType !== 'FACULTY' || existingSession.facultyId !== user.userId) {
        return NextResponse.json(
          createResponse(false, 'Only the assigned faculty can perform this action'),
          { status: 403 }
        );
      }
    } else if (action === 'cancel') {
      // Student or faculty can cancel
      if (
        (user.userType === 'STUDENT' && existingSession.studentId !== user.userId) ||
        (user.userType === 'FACULTY' && existingSession.facultyId !== user.userId)
      ) {
        return NextResponse.json(
          createResponse(false, 'Unauthorized to cancel this session'),
          { status: 403 }
        );
      }
    } else if (action === 'complete') {
      // Only faculty can mark as complete
      if (user.userType !== 'FACULTY' || existingSession.facultyId !== user.userId) {
        return NextResponse.json(
          createResponse(false, 'Only the assigned faculty can mark session as complete'),
          { status: 403 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    let notificationTitle = '';
    let notificationMessage = '';
    let notificationType: any = 'GENERAL';
    let recipientType: 'STUDENT' | 'FACULTY' = 'STUDENT';
    let recipientId = existingSession.studentId;

    switch (action) {
      case 'approve':
        // Generate Google Meet link
        let meetLink = '';
        let googleEventId = '';
        
        try {
          // Combine scheduled date and time to create full datetime
          const scheduledDateTime = new Date(existingSession.scheduledDate);
          const [hours, minutes] = existingSession.scheduledTime.split(':');
          scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          const meetResponse = await generateSessionMeetLink(
            existingSession.title,
            existingSession.description || 'Counseling Session',
            scheduledDateTime,
            existingSession.duration,
            existingSession.student.email,
            existingSession.faculty.email,
            facultyNotes
          );

          if (meetResponse.success && meetResponse.meetLink) {
            meetLink = meetResponse.meetLink;
            googleEventId = meetResponse.eventId || '';
            console.log('Google Meet link generated:', meetLink);
          } else {
            // Fallback to simple meet link if Google Calendar API fails
            console.warn('Google Meet generation failed, using fallback:', meetResponse.error);
            meetLink = generateSimpleMeetLink();
          }
        } catch (error) {
          console.error('Error generating meet link:', error);
          // Fallback to simple meet link
          meetLink = generateSimpleMeetLink();
        }

        updateData.status = 'APPROVED';
        updateData.approvedAt = new Date();
        updateData.meetingLink = meetLink;
        if (googleEventId) {
          updateData.googleEventId = googleEventId;
        }
        if (facultyNotes) updateData.facultyNotes = facultyNotes;
        
        notificationTitle = 'Session Approved';
        notificationMessage = `Your session request with ${existingSession.faculty.name} has been approved for ${new Date(existingSession.scheduledDate).toLocaleDateString()} at ${existingSession.scheduledTime}`;
        notificationType = 'SESSION_APPROVED';
        break;

      case 'reject':
        if (!rejectionReason) {
          return NextResponse.json(
            createResponse(false, 'Rejection reason is required'),
            { status: 400 }
          );
        }
        updateData.status = 'REJECTED';
        updateData.rejectedAt = new Date();
        updateData.rejectionReason = rejectionReason;
        if (facultyNotes) updateData.facultyNotes = facultyNotes;
        notificationTitle = 'Session Rejected';
        notificationMessage = `Your session request with ${existingSession.faculty.name} has been rejected. Reason: ${rejectionReason}`;
        notificationType = 'SESSION_REJECTED';
        break;

      case 'reschedule':
        if (!scheduledDate || !scheduledTime) {
          return NextResponse.json(
            createResponse(false, 'New date and time are required for rescheduling'),
            { status: 400 }
          );
        }
        updateData.status = 'RESCHEDULED';
        updateData.scheduledDate = new Date(scheduledDate);
        updateData.scheduledTime = scheduledTime;
        if (facultyNotes) updateData.facultyNotes = facultyNotes;
        notificationTitle = 'Session Rescheduled';
        notificationMessage = `Your session with ${existingSession.faculty.name} has been rescheduled to ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime}`;
        notificationType = 'SESSION_RESCHEDULED';
        break;

      case 'complete':
        updateData.status = 'COMPLETED';
        updateData.completedAt = new Date();
        if (facultyNotes) updateData.facultyNotes = facultyNotes;
        notificationTitle = 'Session Completed';
        notificationMessage = `Your session with ${existingSession.faculty.name} has been marked as completed`;
        notificationType = 'SESSION_COMPLETED';
        break;

      case 'cancel':
        updateData.status = 'CANCELLED';
        if (user.userType === 'STUDENT') {
          recipientType = 'FACULTY';
          recipientId = existingSession.facultyId;
          notificationMessage = `${existingSession.student.name} has cancelled the session scheduled for ${new Date(existingSession.scheduledDate).toLocaleDateString()} at ${existingSession.scheduledTime}`;
        } else {
          notificationMessage = `${existingSession.faculty.name} has cancelled your session scheduled for ${new Date(existingSession.scheduledDate).toLocaleDateString()} at ${existingSession.scheduledTime}`;
        }
        notificationTitle = 'Session Cancelled';
        notificationType = 'SESSION_CANCELLED';
        break;

      default:
        return NextResponse.json(
          createResponse(false, 'Invalid action'),
          { status: 400 }
        );
    }

    // Update the session
    const updatedSession = await prisma.sessionBooking.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            enrollmentId: true,
          },
        },
        faculty: {
          select: {
            id: true,
            name: true,
            email: true,
            jobTitle: true,
          },
        },
      },
    });

    // Create notification
    const notificationData: any = {
      title: notificationTitle,
      message: notificationMessage,
      type: notificationType,
      recipientType,
      relatedId: updatedSession.id,
      relatedType: 'SESSION_BOOKING',
      sessionBookingId: updatedSession.id,
    };

    if (recipientType === 'STUDENT') {
      notificationData.studentRecipientId = recipientId;
      notificationData.actionUrl = `/student/sessions/${updatedSession.id}`;
    } else {
      notificationData.facultyRecipientId = recipientId;
      notificationData.actionUrl = `/faculty/sessions/${updatedSession.id}`;
    }

    await prisma.notification.create({
      data: notificationData,
    });

    // Send email notifications for approved sessions
    if (action === 'approve' && updatedSession.meetingLink) {
      try {
        const scheduledDateTime = new Date(updatedSession.scheduledDate);
        const emailResult = await sendSessionApprovalEmails({
          studentName: updatedSession.student.name,
          studentEmail: updatedSession.student.email,
          facultyName: updatedSession.faculty.name,
          facultyEmail: updatedSession.faculty.email,
          sessionTitle: updatedSession.title,
          sessionDate: scheduledDateTime.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          sessionTime: updatedSession.scheduledTime,
          duration: updatedSession.duration,
          meetLink: updatedSession.meetingLink,
          sessionType: updatedSession.sessionType,
          location: updatedSession.location,
          notes: updatedSession.facultyNotes,
        });

        console.log('Email sending result:', emailResult);
        
        if (!emailResult.studentEmailSent || !emailResult.facultyEmailSent) {
          console.warn('Some emails failed to send:', emailResult);
        }
      } catch (emailError) {
        // Log error but don't fail the request
        console.error('Error sending approval emails:', emailError);
      }
    }

    return NextResponse.json(
      createResponse(true, `Session ${action}d successfully`, { session: updatedSession }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Update session error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      createResponse(false, `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`),
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/[id] - Delete a session (hard delete, use with caution)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    const session = await prisma.sessionBooking.findUnique({
      where: { id },
    });

    if (!session) {
      return NextResponse.json(
        createResponse(false, 'Session not found'),
        { status: 404 }
      );
    }

    // Only the student who created it can delete
    if (user.userType !== 'STUDENT' || session.studentId !== user.userId) {
      return NextResponse.json(
        createResponse(false, 'Only the student who created this session can delete it'),
        { status: 403 }
      );
    }

    // Only allow deletion of pending sessions
    if (session.status !== 'PENDING') {
      return NextResponse.json(
        createResponse(false, 'Can only delete pending sessions'),
        { status: 400 }
      );
    }

    await prisma.sessionBooking.delete({
      where: { id },
    });

    return NextResponse.json(
      createResponse(true, 'Session deleted successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  }
}
