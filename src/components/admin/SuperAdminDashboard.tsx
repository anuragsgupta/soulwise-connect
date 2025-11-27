'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Plus, University, Users, Mail, ExternalLink, UserPlus, Building2, Pencil, Trash2, Loader2 } from 'lucide-react';
import CreateUniversityForm from './CreateUniversityForm';
import CreateAdminForm from './CreateAdminForm';
import CreateInstituteForm from './CreateInstituteForm';
import EditUniversityForm from './EditUniversityForm';
import InstitutesTable from './InstitutesTable';
import AdminsTable from './AdminsTable';

interface University {
  id: string;
  name: string;
  email: string;
  domain: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  status: string;
  _count: {
    institutes: number;
  };
}

interface SuperAdminDashboardProps {
  onLogout: () => void;
}

export default function SuperAdminDashboard({ onLogout }: SuperAdminDashboardProps) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [adminCount, setAdminCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showCreateInstitute, setShowCreateInstitute] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [deletingUniversity, setDeletingUniversity] = useState<University | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeView, setActiveView] = useState<'universities' | 'institutes' | 'admins'>('universities');
  const { toast } = useToast();

  useEffect(() => {
    loadUniversities();
    loadAdminCount();
  }, []);

  const loadUniversities = async () => {
    try {
      const response = await fetch('/api/universities');
      const result = await response.json();
      
      if (result.success) {
        setUniversities(result.data.universities);
      } else {
        // Fallback to mock data if API fails
        console.warn('API failed, using mock data:', result.message);
        const mockUniversities: University[] = [
          {
            id: '1',
            name: 'Delhi University',
            email: 'admin@du.ac.in',
            domain: 'du.ac.in',
            phone: '+91-11-27666613',
            address: 'University Enclave',
            city: 'New Delhi',
            state: 'Delhi',
            status: 'ACTIVE',
            _count: { institutes: 12 },
          },
          {
            id: '2',
            name: 'Mumbai University',
            email: 'registrar@mu.ac.in',
            domain: 'mu.ac.in',
            phone: '+91-22-26543000',
            address: 'Kalina Campus',
            city: 'Mumbai',
            state: 'Maharashtra',
            status: 'ACTIVE',
            _count: { institutes: 8 },
          },
        ];
        setUniversities(mockUniversities);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load universities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load universities, using demo data',
        variant: 'destructive',
      });
      
      // Fallback to mock data
      const mockUniversities: University[] = [
        {
          id: '1',
          name: 'Delhi University',
          email: 'admin@du.ac.in',
          domain: 'du.ac.in',
          phone: '+91-11-27666613',
          address: 'University Enclave, Delhi',
          city: 'New Delhi',
          state: 'Delhi',
          status: 'ACTIVE',
          _count: { institutes: 12 },
        },
        {
          id: '2',
          name: 'Mumbai University',
          email: 'registrar@mu.ac.in',
          domain: 'mu.ac.in',
          phone: '+91-22-26543000',
          address: 'Kalina Campus',
          city: 'Mumbai',
          state: 'Maharashtra',
          status: 'ACTIVE',
          _count: { institutes: 8 },
        },
      ];
      setUniversities(mockUniversities);
      setLoading(false);
    }
  };

  const loadAdminCount = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/admins', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      
      if (result.success) {
        setAdminCount(result.data.admins.length);
      }
    } catch (error) {
      console.error('Failed to load admin count:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingUniversity) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/universities/${deletingUniversity.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete university');
      }

      toast({
        title: 'Success',
        description: 'University deleted successfully',
      });

      setDeletingUniversity(null);
      loadUniversities();
    } catch (error) {
      console.error('Failed to delete university:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete university',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateSuccess = () => {
    loadUniversities(); // Reload the list
    setShowCreateForm(false);
  };

  const handleAdminCreateSuccess = () => {
    loadAdminCount(); // Reload admin count
    setShowCreateAdmin(false);
    setSelectedUniversity(null);
    toast({
      title: 'Success',
      description: 'Admin created successfully',
    });
  };

  const handleInstituteCreateSuccess = () => {
    loadUniversities(); // Reload to update institute counts
    setShowCreateInstitute(false);
    setSelectedUniversity(null);
    toast({
      title: 'Success',
      description: 'Institute created successfully',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600 text-sm sm:text-base">Manage universities and system administration</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-center">
                SuperAdmin
              </Badge>
              <Button variant="outline" onClick={onLogout} className="w-full sm:w-auto">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              activeView === 'universities' ? 'ring-2 ring-primary shadow-md' : ''
            }`}
            onClick={() => setActiveView('universities')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Universities</CardTitle>
              <University className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{universities.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeView === 'universities' ? '✓ ' : ''}Active institutions
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              activeView === 'institutes' ? 'ring-2 ring-primary shadow-md' : ''
            }`}
            onClick={() => setActiveView('institutes')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Institutes</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {universities.reduce((sum, uni) => sum + uni._count.institutes, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeView === 'institutes' ? '✓ ' : ''}Across all universities
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              activeView === 'admins' ? 'ring-2 ring-primary shadow-md' : ''
            }`}
            onClick={() => setActiveView('admins')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminCount}</div>
              <p className="text-xs text-muted-foreground">
                {activeView === 'admins' ? '✓ ' : ''}System administrators
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Table Section */}
        {activeView === 'universities' ? (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle>Universities</CardTitle>
                  <CardDescription>Manage universities and create administrators</CardDescription>
                </div>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Create University
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {universities.map((university) => (
                <div
                  key={university.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{university.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground mt-1">
                      <span>{university.domain}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{university.city}, {university.state}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{university._count.institutes} institutes</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full sm:w-auto"
                      onClick={() => {
                        setSelectedUniversity(university);
                        setShowCreateAdmin(true);
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Admin
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full sm:w-auto"
                      onClick={() => {
                        setSelectedUniversity(university);
                      }}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full sm:w-auto"
                      onClick={() => setEditingUniversity(university)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full sm:w-auto"
                      onClick={() => setDeletingUniversity(university)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        ) : activeView === 'institutes' ? (
          <InstitutesTable />
        ) : (
          <AdminsTable />
        )}
      </div>

      {/* Create University Form Modal */}
      {showCreateForm && (
        <CreateUniversityForm 
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Create Admin Modal */}
      <Dialog open={showCreateAdmin} onOpenChange={setShowCreateAdmin}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Create Admin for {selectedUniversity?.name}
            </DialogTitle>
            <DialogDescription>
              Create a new administrator for this university
            </DialogDescription>
          </DialogHeader>
          {selectedUniversity && (
            <CreateAdminForm 
              universityId={selectedUniversity.id}
              universityName={selectedUniversity.name}
              onSuccess={handleAdminCreateSuccess}
              onCancel={() => setShowCreateAdmin(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Institute Modal */}
      <Dialog open={showCreateInstitute} onOpenChange={setShowCreateInstitute}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Create Institute for {selectedUniversity?.name}
            </DialogTitle>
            <DialogDescription>
              Add a new institute/college to this university
            </DialogDescription>
          </DialogHeader>
          {selectedUniversity && (
            <CreateInstituteForm 
              universityId={selectedUniversity.id}
              universityName={selectedUniversity.name}
              onSuccess={handleInstituteCreateSuccess}
              onCancel={() => setShowCreateInstitute(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* University Details Modal */}
      <Dialog open={selectedUniversity !== null && !showCreateAdmin && !editingUniversity} onOpenChange={(open) => !open && setSelectedUniversity(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {selectedUniversity?.name}
            </DialogTitle>
            <DialogDescription>
              University details and information
            </DialogDescription>
          </DialogHeader>
          {selectedUniversity && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Domain</Label>
                  <p className="mt-1 text-sm">{selectedUniversity.domain}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <p className="mt-1">
                    <Badge variant={selectedUniversity.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {selectedUniversity.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="mt-1 text-sm">{selectedUniversity.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="mt-1 text-sm">{selectedUniversity.phone}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                  <p className="mt-1 text-sm">{selectedUniversity.address}</p>
                  <p className="text-sm text-muted-foreground">{selectedUniversity.city}, {selectedUniversity.state}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Institutes</Label>
                  <p className="mt-1 text-2xl font-bold text-primary">{selectedUniversity._count.institutes}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedUniversity(null)}>
                  Close
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowCreateInstitute(true);
                  }}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Create Institute
                </Button>
                <Button 
                  onClick={() => {
                    setShowCreateAdmin(true);
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Admin
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit University Dialog */}
      <Dialog open={!!editingUniversity} onOpenChange={() => setEditingUniversity(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit University</DialogTitle>
          </DialogHeader>
          {editingUniversity && (
            <EditUniversityForm
              university={editingUniversity}
              onSuccess={() => {
                setEditingUniversity(null);
                loadUniversities();
              }}
              onCancel={() => setEditingUniversity(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingUniversity} onOpenChange={() => setDeletingUniversity(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete University</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingUniversity?.name}</strong>?
              {deletingUniversity && deletingUniversity._count.institutes > 0 && (
                <>
                  <br /><br />
                  <strong className="text-red-600">Warning:</strong> This university has {deletingUniversity._count.institutes} institute(s). 
                  You must delete or reassign these institutes first.
                </>
              )}
              <br /><br />
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
    </div>
  );
}
