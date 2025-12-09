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
          // Get recent mood check-ins (last 7 days)
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          const moodCheckIns = await prisma.moodCheckIn.findMany({
            where: {
              studentId: student.id,
              checkInDate: {
                gte: sevenDaysAgo,
              },
            },
            orderBy: {
              checkInDate: 'desc',
            },
            take: 7,
          });

          // Get most recent PHQ-9 score
          const phq9Assessment = await prisma.pHQ9Survey.findFirst({
            where: {
              studentId: student.id,
            },
            orderBy: {
              completedAt: 'desc',
            },
          });

          // Get most recent GAD-7 score
          const gad7Assessment = await prisma.gAD7Survey.findFirst({
            where: {
              studentId: student.id,
            },
            orderBy: {
              completedAt: 'desc',
            },
          });

          // Get chatbot interactions (last 7 days) - need to go through ChatSession
          const chatSessions = await prisma.chatSession.findMany({
            where: {
              studentId: student.id,
              createdAt: {
                gte: sevenDaysAgo,
              },
            },
            select: {
              sentimentScore: true,
            },
          });

          // Extract sentiment scores (0-1 scale)
          const chatbotSentiments = chatSessions
            .filter(session => session.sentimentScore !== null)
            .map(session => Number(session.sentimentScore));

          // Prepare input for wellness score calculation
          // Convert mood scores from 1-7 scale to 1-10 scale for wellness calculation
          const moodEntries = moodCheckIns.map(mc => ({
            score: Math.round(((mc.moodScore - 1) / 6) * 9 + 1), // Convert 1-7 to 1-10
            date: new Date(mc.checkInDate),
          }));

          const input: WellnessScoreInput = {
            moodEntries: moodEntries,
            latestPHQ9Score: phq9Assessment?.totalScore ?? null,
            latestGAD7Score: gad7Assessment?.totalScore ?? null,
            chatbotSentiments: chatbotSentiments,
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
                           phq9Assessment?.completedAt || 
                           gad7Assessment?.completedAt || 
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
