'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Loader2 } from 'lucide-react';

interface Faculty {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  facultyType: string;
  status: string;
  availabilityStatus: string;
  yearsOfExperience: number;
  department: {
    id: string;
    name: string;
    code: string;
  };
}

interface FacultiesTableProps {
  instituteId?: string;
}

export default function FacultiesTable({ instituteId }: FacultiesTableProps) {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

  useEffect(() => {
    loadFaculties();
  }, [instituteId]);

  const loadFaculties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      const url = instituteId 
        ? `/api/faculties?instituteId=${instituteId}`
        : '/api/faculties';
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const result = await response.json();
      if (result.success) {
        setFaculties(result.data.faculties);
      }
    } catch (error) {
      console.error('Failed to load faculties:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-600">Active</Badge>;
      case 'INACTIVE':
        return <Badge variant="outline">Inactive</Badge>;
      case 'ON_LEAVE':
        return <Badge className="bg-yellow-600">On Leave</Badge>;
      case 'RETIRED':
        return <Badge className="bg-gray-600">Retired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAvailabilityBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge className="bg-green-600">Available</Badge>;
      case 'BUSY':
        return <Badge className="bg-orange-600">Busy</Badge>;
      case 'ON_LEAVE':
        return <Badge className="bg-gray-600">On Leave</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFacultyTypeBadge = (type: string) => {
    switch (type) {
      case 'PERMANENT':
        return <Badge className="bg-blue-600">Permanent</Badge>;
      case 'VISITING':
        return <Badge className="bg-purple-600">Visiting</Badge>;
      case 'CONTRACTUAL':
        return <Badge className="bg-yellow-600">Contractual</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (faculties.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No faculty members found</p>
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
              <TableHead>Email</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faculties.map((faculty) => (
              <TableRow key={faculty.id}>
                <TableCell className="font-medium">{faculty.name}</TableCell>
                <TableCell>{faculty.email}</TableCell>
                <TableCell>{faculty.jobTitle || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{faculty.department.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {faculty.department.code}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{getFacultyTypeBadge(faculty.facultyType)}</TableCell>
                <TableCell>{faculty.yearsOfExperience ? `${faculty.yearsOfExperience} years` : 'N/A'}</TableCell>
                <TableCell>{getStatusBadge(faculty.status)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFaculty(faculty)}
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
      <Dialog open={!!selectedFaculty} onOpenChange={() => setSelectedFaculty(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Faculty Details</DialogTitle>
          </DialogHeader>
          {selectedFaculty && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm">{selectedFaculty.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{selectedFaculty.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm">{selectedFaculty.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Job Title</p>
                  <p className="text-sm">{selectedFaculty.jobTitle || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p className="text-sm">{selectedFaculty.department.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Faculty Type</p>
                  <div className="mt-1">{getFacultyTypeBadge(selectedFaculty.facultyType)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Years of Experience</p>
                  <p className="text-sm">{selectedFaculty.yearsOfExperience ? `${selectedFaculty.yearsOfExperience} years` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedFaculty.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Availability</p>
                  <div className="mt-1">{getAvailabilityBadge(selectedFaculty.availabilityStatus)}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
