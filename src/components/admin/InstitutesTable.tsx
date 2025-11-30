'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Building2, Users, GraduationCap, BookOpen, Mail, Phone, MapPin, Edit, Trash2 } from 'lucide-react';
import EditInstituteForm from './EditInstituteForm';

interface Institute {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  university: {
    id: string;
    name: string;
  };
  field: {
    id: string;
    name: string;
  };
  _count: {
    departments: number;
    faculties: number;
    students: number;
  };
}

interface InstitutesTableProps {
  onCreateInstitute?: () => void;
  universityId?: string;
}

export default function InstitutesTable({ onCreateInstitute, universityId }: InstitutesTableProps) {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(null);
  const [editingInstitute, setEditingInstitute] = useState<Institute | null>(null);
  const [deletingInstitute, setDeletingInstitute] = useState<Institute | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadInstitutes();
  }, [universityId]);

  const loadInstitutes = async () => {
    try {
      setLoading(true);
      const url = universityId ? `/api/institutes?universityId=${universityId}` : '/api/institutes';
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setInstitutes(result.data.institutes);
      }
    } catch (error) {
      console.error('Failed to load institutes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    loadInstitutes();
    setEditingInstitute(null);
    toast({
      title: 'Success',
      description: 'Institute updated successfully',
    });
  };

  const handleDelete = async () => {
    if (!deletingInstitute) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/institutes/${deletingInstitute.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete institute');
      }

      toast({
        title: 'Success',
        description: 'Institute deleted successfully',
      });

      loadInstitutes();
      setDeletingInstitute(null);
    } catch (error) {
      console.error('Error deleting institute:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete institute',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Institutes</CardTitle>
              <CardDescription>All institutes across universities</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {institutes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No institutes found</p>
              <p className="text-sm">Create a university first, then add institutes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {institutes.map((institute) => (
                <div
                  key={institute.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{institute.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {institute.university.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {institute.code}
                            </Badge>
                          </span>
                          {institute.field && (
                            <>
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {institute.field.name}
                              </span>
                              <span className="hidden sm:inline">•</span>
                            </>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {institute._count.departments} depts
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {institute._count.faculties} faculty
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {institute._count.students} students
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={institute.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {institute.status}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingInstitute(institute)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDeletingInstitute(institute)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedInstitute(institute)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Institute Details Modal */}
      <Dialog open={selectedInstitute !== null} onOpenChange={(open) => !open && setSelectedInstitute(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {selectedInstitute?.name}
            </DialogTitle>
            <DialogDescription>
              Institute details and information
            </DialogDescription>
          </DialogHeader>
          {selectedInstitute && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Institute Code</Label>
                  <p className="mt-1">
                    <Badge variant="outline">{selectedInstitute.code}</Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <p className="mt-1">
                    <Badge variant={selectedInstitute.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {selectedInstitute.status}
                    </Badge>
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">University</Label>
                  <p className="mt-1 text-sm">{selectedInstitute.university.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Field</Label>
                  <p className="mt-1">
                    <Badge variant="outline" className="bg-primary/10">
                      {selectedInstitute.field.name}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </Label>
                  <p className="mt-1 text-sm">{selectedInstitute.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone
                  </Label>
                  <p className="mt-1 text-sm">{selectedInstitute.phone}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Address
                  </Label>
                  <p className="mt-1 text-sm">{selectedInstitute.address}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-muted-foreground">Statistics</Label>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedInstitute._count.departments}</div>
                    <div className="text-xs text-blue-600 mt-1">Departments</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedInstitute._count.faculties}</div>
                    <div className="text-xs text-green-600 mt-1">Faculty Members</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedInstitute._count.students}</div>
                    <div className="text-xs text-purple-600 mt-1">Students</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedInstitute(null)}>
                  Close
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingInstitute(selectedInstitute);
                    setSelectedInstitute(null);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Institute Modal */}
      <Dialog open={editingInstitute !== null} onOpenChange={(open) => !open && setEditingInstitute(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit Institute
            </DialogTitle>
            <DialogDescription>
              Update institute information
            </DialogDescription>
          </DialogHeader>
          {editingInstitute && (
            <EditInstituteForm
              institute={editingInstitute}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingInstitute(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingInstitute !== null} onOpenChange={(open) => !open && setDeletingInstitute(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deletingInstitute?.name}</strong>.
              This action cannot be undone. The institute can only be deleted if it has no departments, faculty, or students.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
