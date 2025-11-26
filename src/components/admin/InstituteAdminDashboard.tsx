'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Building2, Users, GraduationCap, BookOpen, Mail, Phone, MapPin, UserCog } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AdminsTable from '@/components/admin/AdminsTable';
import StudentsTable from '@/components/admin/StudentsTable';
import FacultiesTable from '@/components/admin/FacultiesTable';
import DepartmentsTable from '@/components/admin/DepartmentsTable';
import CreateAdminForm from '@/components/admin/CreateAdminForm';
import CreateDepartmentForm from '@/components/admin/CreateDepartmentForm';
import CreateFacultyForm from '@/components/admin/CreateFacultyForm';
import CreateStudentForm from '@/components/admin/CreateStudentForm';
import CreateBatchForm from '@/components/admin/CreateBatchForm';

interface InstituteStats {
  departments: number;
  faculties: number;
  students: number;
  admins: number;
}

interface InstituteAdminDashboardProps {
  onLogout: () => void;
}

export default function InstituteAdminDashboard({ onLogout }: InstituteAdminDashboardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<InstituteStats>({ departments: 0, faculties: 0, students: 0, admins: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showCreateDepartment, setShowCreateDepartment] = useState(false);
  const [showCreateFaculty, setShowCreateFaculty] = useState(false);
  const [showCreateStudent, setShowCreateStudent] = useState(false);
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [activeView, setActiveView] = useState<'admins' | 'students' | 'faculties' | 'departments' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.instituteId) {
      loadInstituteData();
    }
  }, [user?.instituteId]);

  const loadInstituteData = async () => {
    if (!user?.instituteId) {
      console.log('No instituteId found on user:', user);
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      
      console.log('Loading data for instituteId:', user.instituteId);
      
      // Load institute details with stats and admins count
      const [instituteResponse, adminsResponse] = await Promise.all([
        fetch(`/api/institutes?universityId=${user.universityId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/admins`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ]);
      
      const instituteResult = await instituteResponse.json();
      const adminsResult = await adminsResponse.json();
      
      console.log('Institute result:', instituteResult);
      console.log('Admins result:', adminsResult);
      
      if (instituteResult.success) {
        const myInstitute = instituteResult.data.institutes.find((inst: any) => inst.id === user.instituteId);
        console.log('My institute:', myInstitute);
        
        if (myInstitute && myInstitute._count) {
          // Filter admins for this institute
          const instituteAdmins = adminsResult.success 
            ? adminsResult.data.admins.filter((admin: any) => admin.instituteId === user.instituteId)
            : [];
          
          console.log('Institute admins:', instituteAdmins);
          
          const newStats = {
            departments: myInstitute._count.departments || 0,
            faculties: myInstitute._count.faculties || 0,
            students: myInstitute._count.students || 0,
            admins: instituteAdmins.length,
          };
          
          console.log('Setting stats:', newStats);
          setStats(newStats);
        }
      }
    } catch (error) {
      console.error('Failed to load institute data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load institute data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Institute Admin Dashboard</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                {user?.institute?.name || 'Manage your institute'}
              </p>
              {user?.university?.name && (
                <p className="text-sm text-muted-foreground mt-1">
                  {user.university.name}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-center">
                Institute Admin
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
        {/* Institute Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Institute Information</CardTitle>
            </div>
            <CardDescription>Details about your institute</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Institute Name</Label>
                <p className="mt-1 text-sm font-medium">{user?.institute?.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Institute Code</Label>
                <p className="mt-1">
                  <Badge variant="outline">{user?.institute?.code}</Badge>
                </p>
              </div>
              {user?.institute?.email && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </Label>
                  <p className="mt-1 text-sm">{user.institute.email}</p>
                </div>
              )}
              {user?.institute?.phone && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone
                  </Label>
                  <p className="mt-1 text-sm">{user.institute.phone}</p>
                </div>
              )}
              {user?.institute?.address && (
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Address
                  </Label>
                  <p className="mt-1 text-sm">{user.institute.address}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveView(activeView === 'admins' ? null : 'admins')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
              <p className="text-xs text-muted-foreground">Institute administrators</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveView(activeView === 'departments' ? null : 'departments')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.departments}</div>
              <p className="text-xs text-muted-foreground">Academic departments</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveView(activeView === 'faculties' ? null : 'faculties')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faculty Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.faculties}</div>
              <p className="text-xs text-muted-foreground">Teaching staff</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveView(activeView === 'students' ? null : 'students')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.students}</div>
              <p className="text-xs text-muted-foreground">Enrolled students</p>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic View Based on Selected Card */}
        {activeView === 'admins' && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <UserCog className="h-5 w-5 text-primary" />
                    <CardTitle>Institute Admins</CardTitle>
                  </div>
                  <CardDescription>Manage administrators for your institute</CardDescription>
                </div>
                <Button
                  onClick={() => setShowCreateAdmin(true)}
                  className="w-full sm:w-auto"
                >
                  Add Admin
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AdminsTable instituteId={user?.instituteId} />
            </CardContent>
          </Card>
        )}

        {activeView === 'departments' && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <CardTitle>Departments</CardTitle>
                  </div>
                  <CardDescription>Manage academic departments in your institute</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => setShowCreateBatch(true)}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Add Batch
                  </Button>
                  <Button
                    onClick={() => setShowCreateDepartment(true)}
                    className="w-full sm:w-auto"
                  >
                    Add Department
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DepartmentsTable instituteId={user?.instituteId} />
            </CardContent>
          </Card>
        )}

        {activeView === 'faculties' && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle>Faculty Members</CardTitle>
                  </div>
                  <CardDescription>Manage faculty members in your institute</CardDescription>
                </div>
                <Button
                  onClick={() => setShowCreateFaculty(true)}
                  className="w-full sm:w-auto"
                >
                  Add Faculty
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <FacultiesTable instituteId={user?.instituteId} />
            </CardContent>
          </Card>
        )}

        {activeView === 'students' && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <CardTitle>Students</CardTitle>
                  </div>
                  <CardDescription>Manage students in your institute</CardDescription>
                </div>
                <Button
                  onClick={() => setShowCreateStudent(true)}
                  className="w-full sm:w-auto"
                >
                  Add Student
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <StudentsTable instituteId={user?.instituteId} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Admin Dialog */}
      <Dialog open={showCreateAdmin} onOpenChange={setShowCreateAdmin}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>
              Create a new institute admin for {user?.institute?.name}
            </DialogDescription>
          </DialogHeader>
          <CreateAdminForm
            universityId={user?.universityId || ''}
            universityName={user?.university?.name || ''}
            onSuccess={() => {
              setShowCreateAdmin(false);
              loadInstituteData();
              toast({
                title: 'Success',
                description: 'Admin created successfully',
              });
            }}
            onCancel={() => setShowCreateAdmin(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Create Department Dialog */}
      <Dialog open={showCreateDepartment} onOpenChange={setShowCreateDepartment}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>
              Create a new department for {user?.institute?.name}
            </DialogDescription>
          </DialogHeader>
          <CreateDepartmentForm
            instituteId={user?.instituteId || ''}
            instituteName={user?.institute?.name || ''}
            onSuccess={() => {
              setShowCreateDepartment(false);
              loadInstituteData();
              toast({
                title: 'Success',
                description: 'Department created successfully',
              });
            }}
            onCancel={() => setShowCreateDepartment(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Create Faculty Dialog */}
      <Dialog open={showCreateFaculty} onOpenChange={setShowCreateFaculty}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Faculty</DialogTitle>
            <DialogDescription>
              Create a new faculty member for {user?.institute?.name}
            </DialogDescription>
          </DialogHeader>
          <CreateFacultyForm
            instituteId={user?.instituteId || ''}
            universityId={user?.universityId || ''}
            instituteName={user?.institute?.name || ''}
            onSuccess={() => {
              setShowCreateFaculty(false);
              loadInstituteData();
              toast({
                title: 'Success',
                description: 'Faculty member created successfully',
              });
            }}
            onCancel={() => setShowCreateFaculty(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Create Student Dialog */}
      <Dialog open={showCreateStudent} onOpenChange={setShowCreateStudent}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Enroll a new student in {user?.institute?.name}
            </DialogDescription>
          </DialogHeader>
          <CreateStudentForm
            instituteId={user?.instituteId || ''}
            universityId={user?.universityId || ''}
            instituteName={user?.institute?.name || ''}
            onSuccess={() => {
              setShowCreateStudent(false);
              loadInstituteData();
              toast({
                title: 'Success',
                description: 'Student created successfully',
              });
            }}
            onCancel={() => setShowCreateStudent(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Create Batch Dialog */}
      <Dialog open={showCreateBatch} onOpenChange={setShowCreateBatch}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Batch</DialogTitle>
            <DialogDescription>
              Create a new batch for {user?.institute?.name}
            </DialogDescription>
          </DialogHeader>
          <CreateBatchForm
            instituteId={user?.instituteId || ''}
            instituteName={user?.institute?.name || ''}
            onSuccess={() => {
              setShowCreateBatch(false);
              loadInstituteData();
              toast({
                title: 'Success',
                description: 'Batch created successfully',
              });
            }}
            onCancel={() => setShowCreateBatch(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
