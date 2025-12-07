'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, Loader2, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EditStudentForm from './EditStudentForm';

interface Student {
  id: string;
  name: string;
  email: string;
  enrollmentId: string;
  rollNumber: string;
  phone: string;
  currentSemester: number;
  cgpa: number;
  status: string;
  department: {
    id: string;
    name: string;
    code: string;
  };
  batch: {
    id: string;
    name: string;
  };
  mentor?: {
    id: string;
    name: string;
  };
}

interface StudentsTableProps {
  instituteId?: string;
}

export default function StudentsTable({ instituteId }: StudentsTableProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStudents();
  }, [instituteId]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const url = instituteId 
        ? `/api/students?instituteId=${instituteId}`
        : '/api/students';
      
      const response = await fetch(url, {
        credentials: 'include', // Use cookies for auth
      });
      
      const result = await response.json();
      if (result.success) {
        setStudents(result.data.students);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/students/${deletingStudent.id}`, {
        method: 'DELETE',
        credentials: 'include', // Use cookies for auth
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete student');
      }

      toast({
        title: 'Success',
        description: 'Student deleted successfully',
      });

      setDeletingStudent(null);
      loadStudents();
    } catch (error) {
      console.error('Failed to delete student:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete student',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-600">Active</Badge>;
      case 'INACTIVE':
        return <Badge variant="outline">Inactive</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-red-600">Suspended</Badge>;
      case 'GRADUATED':
        return <Badge className="bg-blue-600">Graduated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No students found</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Enrollment ID</TableHead>
              <TableHead>Roll Number</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>CGPA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.enrollmentId}</TableCell>
                <TableCell>{student.rollNumber || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{student.department.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {student.department.code}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{student.currentSemester}</TableCell>
                <TableCell>{student.cgpa ? student.cgpa.toString() : 'N/A'}</TableCell>
                <TableCell>{getStatusBadge(student.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingStudent(student)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingStudent(student)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{selectedStudent.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Enrollment ID</p>
                  <p className="text-sm">{selectedStudent.enrollmentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Roll Number</p>
                  <p className="text-sm">{selectedStudent.rollNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm">{selectedStudent.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p className="text-sm">{selectedStudent.department.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Batch</p>
                  <p className="text-sm">{selectedStudent.batch.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Semester</p>
                  <p className="text-sm">{selectedStudent.currentSemester}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CGPA</p>
                  <p className="text-sm">{selectedStudent.cgpa ? selectedStudent.cgpa.toString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedStudent.status)}</div>
                </div>
                {selectedStudent.mentor && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mentor</p>
                    <p className="text-sm">{selectedStudent.mentor.name}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {editingStudent && (
            <EditStudentForm
              student={editingStudent}
              onSuccess={() => {
                setEditingStudent(null);
                loadStudents();
              }}
              onCancel={() => setEditingStudent(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingStudent} onOpenChange={() => setDeletingStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingStudent?.name}</strong> (Enrollment ID: {deletingStudent?.enrollmentId})?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
