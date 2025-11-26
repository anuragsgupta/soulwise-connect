'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Loader2 } from 'lucide-react';

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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDepartment(department)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
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
    </>
  );
}
