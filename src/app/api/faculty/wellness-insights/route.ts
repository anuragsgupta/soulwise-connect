import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/middleware/auth';
import { createResponse } from '@/lib/auth';
import { calculateWellnessScore, WellnessScoreInput } from '@/lib/wellness-score';

// GET /api/faculty/wellness-insights - Get wellness insights for all students
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    if (user.userType !== 'FACULTY') {
      return NextResponse.json(
        createResponse(false, 'Only faculty can access this endpoint'),
        { status: 403 }
      );
    }

    // Get faculty details
    const faculty = await prisma.faculty.findUnique({
      where: { id: user.userId },
      select: {
        instituteId: true,
      },
    });

    if (!faculty) {
      return NextResponse.json(
        createResponse(false, 'Faculty not found'),
        { status: 404 }
      );
    }

    // Fetch all active students in the institute
    const students = await prisma.student.findMany({
      where: {
        instituteId: faculty.instituteId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Calculate wellness data for each student
    const wellnessData = await Promise.all(
      students.map(async (student) => {
        try {
          // Use the same logic as /api/wellness-score endpoint
          // Fetch mood check-ins from the last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const moodCheckIns = await prisma.moodCheckIn.findMany({
            where: {
              studentId: student.id,
              checkInDate: {
                gte: thirtyDaysAgo,
              },
            },
            orderBy: {
              checkInDate: 'asc',
            },
          });

          // Convert mood check-ins to the format expected by wellness score calculator
          const moodEntries = moodCheckIns.map(checkIn => ({
            score: checkIn.moodScore,
            date: new Date(checkIn.checkInDate),
          }));

          // Get most recent PHQ-9 score
          let latestPHQ9 = null;
          try {
            latestPHQ9 = await prisma.pHQ9Survey.findFirst({
              where: { studentId: student.id },
              orderBy: { completedAt: 'desc' },
            });
          } catch (err) {
            console.error('Error fetching PHQ9 survey:', err);
          }

          // Get most recent GAD-7 score
          let latestGAD7 = null;
          try {
            latestGAD7 = await prisma.gAD7Survey.findFirst({
              where: { studentId: student.id },
              orderBy: { completedAt: 'desc' },
            });
          } catch (err) {
            console.error('Error fetching GAD7 survey:', err);
          }

          // Fetch chatbot sentiment scores from recent sessions (last 30 days)
          const chatSessions = await prisma.chatSession.findMany({
            where: {
              studentId: student.id,
              sessionStart: {
                gte: thirtyDaysAgo,
              },
            },
            orderBy: {
              sessionStart: 'asc',
            },
            select: {
              sentimentScore: true,
            },
          });

          // Convert sentiment scores to array (default to 0.5 if null)
          const chatbotSentiments = chatSessions
            .map(session => session.sentimentScore ? parseFloat(session.sentimentScore.toString()) : 0.5)
            .filter(score => score >= 0 && score <= 1);

          // If no chatbot data, provide a default neutral sentiment
          if (chatbotSentiments.length === 0) {
            chatbotSentiments.push(0.5);
          }

          // Prepare input for wellness score calculation (same as student dashboard)
          const input: WellnessScoreInput = {
            moodEntries,
            latestPHQ9Score: latestPHQ9 ? latestPHQ9.totalScore : null,
            latestGAD7Score: latestGAD7 ? latestGAD7.totalScore : null,
            chatbotSentiments,
          };

          // Calculate wellness score
          const wellnessResult = calculateWellnessScore(input);

          // Determine risk level based on overall score
          let riskLevel: 'low' | 'medium' | 'high' | 'critical';
          if (wellnessResult.overallScore < 30) {
            riskLevel = 'critical';
          } else if (wellnessResult.overallScore < 50) {
            riskLevel = 'high';
          } else if (wellnessResult.overallScore < 70) {
            riskLevel = 'medium';
          } else {
            riskLevel = 'low';
          }

          // Get last update time
          const lastUpdate = moodCheckIns[0]?.createdAt || 
                           latestPHQ9?.completedAt || 
                           latestGAD7?.completedAt || 
                           new Date();

          const timeDiff = Date.now() - lastUpdate.getTime();
          const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
          const daysDiff = Math.floor(hoursDiff / 24);
          
          let lastUpdated: string;
          if (hoursDiff < 1) {
            lastUpdated = 'Just now';
          } else if (hoursDiff < 24) {
            lastUpdated = `${hoursDiff} ${hoursDiff === 1 ? 'hour' : 'hours'} ago`;
          } else {
            lastUpdated = `${daysDiff} ${daysDiff === 1 ? 'day' : 'days'} ago`;
          }

          return {
            studentId: student.id,
            studentName: student.name,
            overallScore: Math.round(wellnessResult.overallScore),
            riskLevel,
            lastUpdated,
          };
        } catch (error) {
          console.error(`Error calculating wellness for student ${student.id}:`, error);
          return null;
        }
      })
    );

    // Filter out null results (students with errors)
    const validWellnessData = wellnessData.filter(data => data !== null);

    return NextResponse.json(
      createResponse(true, 'Wellness insights retrieved successfully', {
        students: validWellnessData,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get wellness insights error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  }
}
