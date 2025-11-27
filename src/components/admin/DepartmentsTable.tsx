'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, Loader2, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EditDepartmentForm from './EditDepartmentForm';

interface Department {
  id: string;
  name: string;
  code: string;
  hod?: {
    id: string;
    name: string;
  };
  _count?: {
    batches: number;
    students: number;
    faculties: number;
  };
}

interface DepartmentsTableProps {
  instituteId?: string;
}

export default function DepartmentsTable({ instituteId }: DepartmentsTableProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDepartments();
  }, [instituteId]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      const url = instituteId 
        ? `/api/departments?instituteId=${instituteId}`
        : '/api/departments';
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const result = await response.json();
      if (result.success) {
        setDepartments(result.data.departments);
      }
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDepartment) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/departments/${deletingDepartment.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete department');
      }

      toast({
        title: 'Success',
        description: 'Department deleted successfully',
      });

      setDeletingDepartment(null);
      loadDepartments();
    } catch (error) {
      console.error('Failed to delete department:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete department',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No departments found</p>
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
              <TableHead>Code</TableHead>
              <TableHead>HOD</TableHead>
              <TableHead>Batches</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Faculties</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell className="font-medium">{department.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{department.code}</Badge>
                </TableCell>
                <TableCell>{department.hod?.name || 'Not Assigned'}</TableCell>
                <TableCell>{department._count?.batches || 0}</TableCell>
                <TableCell>{department._count?.students || 0}</TableCell>
                <TableCell>{department._count?.faculties || 0}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDepartment(department)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingDepartment(department)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingDepartment(department)}
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
      <Dialog open={!!selectedDepartment} onOpenChange={() => setSelectedDepartment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Department Details</DialogTitle>
          </DialogHeader>
          {selectedDepartment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department Name</p>
                  <p className="text-sm">{selectedDepartment.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department Code</p>
                  <Badge variant="outline">{selectedDepartment.code}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Head of Department</p>
                  <p className="text-sm">{selectedDepartment.hod?.name || 'Not Assigned'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Batches</p>
                  <p className="text-sm">{selectedDepartment._count?.batches || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-sm">{selectedDepartment._count?.students || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Faculties</p>
                  <p className="text-sm">{selectedDepartment._count?.faculties || 0}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={!!editingDepartment} onOpenChange={() => setEditingDepartment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          {editingDepartment && (
            <EditDepartmentForm
              department={editingDepartment}
              onSuccess={() => {
                setEditingDepartment(null);
                loadDepartments();
              }}
              onCancel={() => setEditingDepartment(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingDepartment} onOpenChange={() => setDeletingDepartment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingDepartment?.name}</strong>?
              {deletingDepartment && deletingDepartment._count && (
                <>
                  <br /><br />
                  <strong className="text-red-600">Warning:</strong> This department has:
                  <ul className="list-disc list-inside mt-2">
                    {deletingDepartment._count.batches > 0 && <li>{deletingDepartment._count.batches} batch(es)</li>}
                    {deletingDepartment._count.students > 0 && <li>{deletingDepartment._count.students} student(s)</li>}
                    {deletingDepartment._count.faculties > 0 && <li>{deletingDepartment._count.faculties} faculty member(s)</li>}
                  </ul>
                  <br />
                  You must reassign or delete these records first.
                </>
              )}
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
