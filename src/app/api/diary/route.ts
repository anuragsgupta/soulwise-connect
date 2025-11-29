import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Retrieve diary entries for a student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const mood = searchParams.get('mood');
    const tag = searchParams.get('tag');

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Build where clause
    const whereClause: any = {
      studentId
    };

    // Add date filters
    if (startDate && endDate) {
      whereClause.entryDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Add mood filter
    if (mood && mood !== 'all') {
      whereClause.mood = mood;
    }

    const entries = await prisma.diaryEntry.findMany({
      where: whereClause,
      orderBy: {
        entryDate: 'desc'
      }
    });

    // Filter by tag if provided (since tags are stored as JSON)
    let filteredEntries = entries;
    if (tag && tag !== 'all') {
      filteredEntries = entries.filter((entry: any) => {
        const tags = entry.tags as string[] || [];
        return tags.includes(tag);
      });
    }

    return NextResponse.json({
      success: true,
      data: filteredEntries
    });
  } catch (error) {
    console.error('Error fetching diary entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch diary entries' },
      { status: 500 }
    );
  }
}

// POST - Create a new diary entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, title, content, mood, tags, wordCount, charCount } = body;

    // Validation
    if (!studentId || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Student ID, title, and content are required' },
        { status: 400 }
      );
    }

    if (!['happy', 'neutral', 'sad'].includes(mood)) {
      return NextResponse.json(
        { success: false, error: 'Invalid mood value' },
        { status: 400 }
      );
    }

    // Create diary entry
    const entry = await prisma.diaryEntry.create({
      data: {
        studentId,
        title,
        content,
        mood,
        tags: tags || [],
        wordCount: wordCount || 0,
        charCount: charCount || 0
      }
    });

    return NextResponse.json({
      success: true,
      data: entry
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating diary entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create diary entry' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing diary entry
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, studentId, title, content, mood, tags, wordCount, charCount } = body;

    if (!id || !studentId) {
      return NextResponse.json(
        { success: false, error: 'Entry ID and Student ID are required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingEntry = await prisma.diaryEntry.findFirst({
      where: {
        id,
        studentId
      }
    });

    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: 'Diary entry not found or access denied' },
        { status: 404 }
      );
    }

    // Update entry
    const updatedEntry = await prisma.diaryEntry.update({
      where: { id },
      data: {
        title,
        content,
        mood,
        tags: tags || [],
        wordCount: wordCount || 0,
        charCount: charCount || 0
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedEntry
    });
  } catch (error) {
    console.error('Error updating diary entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update diary entry' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a diary entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const studentId = searchParams.get('studentId');

    if (!id || !studentId) {
      return NextResponse.json(
        { success: false, error: 'Entry ID and Student ID are required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingEntry = await prisma.diaryEntry.findFirst({
      where: {
        id,
        studentId
      }
    });

    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: 'Diary entry not found or access denied' },
        { status: 404 }
      );
    }

    // Delete entry
    await prisma.diaryEntry.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Diary entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting diary entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete diary entry' },
      { status: 500 }
    );
  }
}
