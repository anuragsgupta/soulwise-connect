import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Retrieve tasks for a student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const completed = searchParams.get('completed');

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

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (priority && priority !== 'all') {
      whereClause.priority = priority;
    }

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (completed !== null && completed !== undefined) {
      whereClause.completed = completed === 'true';
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: [
        { completed: 'asc' },
        { dueDate: 'asc' },
        { created_at: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, title, description, priority, category, dueDate } = body;

    // Validation
    if (!studentId || !title) {
      return NextResponse.json(
        { success: false, error: 'Student ID and title are required' },
        { status: 400 }
      );
    }

    if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return NextResponse.json(
        { success: false, error: 'Invalid priority value' },
        { status: 400 }
      );
    }

    if (!['personal', 'academic', 'health', 'work', 'other'].includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category value' },
        { status: 400 }
      );
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        studentId,
        title,
        description: description || null,
        priority,
        category,
        status: 'pending',
        dueDate: dueDate ? new Date(dueDate) : null,
        completed: false
      }
    });

    return NextResponse.json({
      success: true,
      data: task
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing task
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, studentId, title, description, priority, category, status, dueDate, completed } = body;

    if (!id || !studentId) {
      return NextResponse.json(
        { success: false, error: 'Task ID and Student ID are required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        studentId
      }
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    
    // Handle completion
    if (completed !== undefined) {
      updateData.completed = completed;
      if (completed && !existingTask.completed) {
        updateData.completedAt = new Date();
        updateData.status = 'completed';
      } else if (!completed && existingTask.completed) {
        updateData.completedAt = null;
      }
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a task
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const studentId = searchParams.get('studentId');

    if (!id || !studentId) {
      return NextResponse.json(
        { success: false, error: 'Task ID and Student ID are required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        studentId
      }
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    // Delete task
    await prisma.task.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
