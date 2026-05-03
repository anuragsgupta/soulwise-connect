import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken, createResponse } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * Calculate current semester based on start year and current date
 */
function calculateCurrentSemester(startYear: number): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 0-indexed, so add 1
  
  // Calculate years passed since start
  const yearsPassed = currentYear - startYear;
  
  // Determine semester based on month (assuming: Jan-Jun = even semester, Jul-Dec = odd semester)
  const semesterInCurrentYear = currentMonth >= 7 ? 1 : 2; // July onwards is semester 1 (odd), before July is semester 2 (even)
  
  // Calculate total semester: (yearsPassed * 2) + current semester offset
  let semester = (yearsPassed * 2) + semesterInCurrentYear;
  
  // Ensure semester is within valid range (1-8)
  if (semester < 1) semester = 1;
  if (semester > 8) semester = 8;
  
  return semester;
}

export async function POST(request: NextRequest) {
  try {
    // Check for cron secret or admin authentication
    const authHeader = request.headers.get('authorization');
    const cronSecret = request.headers.get('x-cron-secret');
    
    // Allow either cron secret (for scheduled jobs) or admin authentication
    if (cronSecret) {
      // Verify cron secret from environment variable
      if (cronSecret !== process.env.CRON_SECRET) {
        return NextResponse.json(
          createResponse(false, 'Invalid cron secret'),
          { status: 401 }
        );
      }
    } else if (authHeader) {
      // Verify admin authentication
      const token = authHeader.replace('Bearer ', '');
      const decoded = verifyToken(token);

      if (!decoded || decoded.userType !== 'ADMIN' || !decoded.isSuperAdmin) {
        return NextResponse.json(
          createResponse(false, 'Unauthorized - Super Admin access required'),
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        createResponse(false, 'Authorization required'),
        { status: 401 }
      );
    }

    // Fetch all active batches
    const batches = await prisma.batch.findMany({
      select: {
        id: true,
        startYear: true,
        currentSemester: true,
        name: true,
      },
    });

    const updates = [];
    let updatedCount = 0;
    let unchangedCount = 0;

    // Update each batch's current semester
    for (const batch of batches) {
      const calculatedSemester = calculateCurrentSemester(batch.startYear);
      
      // Only update if semester has changed
      if (calculatedSemester !== batch.currentSemester) {
        await prisma.batch.update({
          where: { id: batch.id },
          data: { currentSemester: calculatedSemester },
        });

        updates.push({
          batchId: batch.id,
          batchName: batch.name,
          oldSemester: batch.currentSemester,
          newSemester: calculatedSemester,
        });

        updatedCount++;
      } else {
        unchangedCount++;
      }
    }

    // Log the update operation
    if (updatedCount > 0) {
      await prisma.auditLog.create({
        data: {
          tableName: 'batches',
          recordId: 'SYSTEM',
          action: 'UPDATE',
          performedById: 'SYSTEM',
          performedByType: 'ADMIN',
          newValues: {
            operation: 'semester_update',
            updatedCount,
            unchangedCount,
            updates,
          },
          timestamp: new Date(),
        },
      });
    }

    return NextResponse.json(
      createResponse(true, 'Batch semesters updated successfully', {
        totalBatches: batches.length,
        updatedCount,
        unchangedCount,
        updates,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Update batch semesters error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET method for manual trigger by super admin
export async function GET(request: NextRequest) {
  // Delegate to POST
  return POST(request);
}
