'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Building2, Users, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import InstitutesTable from './InstitutesTable';
import AdminsTable from './AdminsTable';
import CreateInstituteForm from './CreateInstituteForm';
import CreateAdminForm from './CreateAdminForm';

interface UniversityAdminDashboardProps {
  onLogout: () => void;
}

export default function UniversityAdminDashboard({ onLogout }: UniversityAdminDashboardProps) {
  const { user } = useAuth();
  const [instituteCount, setInstituteCount] = useState<number>(0);
  const [adminCount, setAdminCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showCreateInstitute, setShowCreateInstitute] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [activeView, setActiveView] = useState<'institutes' | 'admins'>('institutes');
  const { toast } = useToast();

  useEffect(() => {
    if (user?.universityId) {
      loadCounts();
    } else if (user && !user.universityId) {
      // User loaded but no universityId - still stop loading
      setLoading(false);
    }
  }, [user?.universityId, user]);

  const loadCounts = async () => {
    if (!user?.universityId) {
      console.log('No universityId found on user:', user);
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      
      console.log('Loading counts for universityId:', user.universityId);
      
      // Load institutes count
      const institutesResponse = await fetch(`/api/institutes?universityId=${user.universityId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const institutesResult = await institutesResponse.json();
      console.log('Institutes result:', institutesResult);
      if (institutesResult.success) {
        setInstituteCount(institutesResult.data.institutes.length);
        console.log('Institute count:', institutesResult.data.institutes.length);
      }

      // Load admins count (excluding super admins, filter by university)
      const adminsResponse = await fetch(`/api/admins`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const adminsResult = await adminsResponse.json();
      console.log('Admins result:', adminsResult);
      if (adminsResult.success) {
        // Filter admins for this university and exclude super admins
        const universityAdmins = adminsResult.data.admins.filter(
          (admin: any) => admin.universityId === user.universityId && !admin.isSuperAdmin
        );
        console.log('Filtered university admins:', universityAdmins);
        setAdminCount(universityAdmins.length);
      }
    } catch (error) {
      console.error('Failed to load counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstituteCreateSuccess = () => {
    loadCounts();
    setShowCreateInstitute(false);
    toast({
      title: 'Success',
      description: 'Institute created successfully',
    });
  };

  const handleAdminCreateSuccess = () => {
    loadCounts();
    setShowCreateAdmin(false);
    toast({
      title: 'Success',
      description: 'Admin created successfully',
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">University Admin Dashboard</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                {user?.university?.name || 'Manage your university'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-center">
                University Admin
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              activeView === 'institutes' ? 'ring-2 ring-primary shadow-md' : ''
            }`}
            onClick={() => setActiveView('institutes')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Institutes</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{instituteCount}</div>
              <p className="text-xs text-muted-foreground">
                {activeView === 'institutes' ? '✓ ' : ''}Under your university
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
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminCount}</div>
              <p className="text-xs text-muted-foreground">
                {activeView === 'admins' ? '✓ ' : ''}Manage administrators
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={() => setShowCreateInstitute(true)}
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Institute
              </Button>
              <Button 
                onClick={() => setShowCreateAdmin(true)}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Admin
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Table Section */}
        {activeView === 'institutes' ? (
          <InstitutesTable universityId={user?.universityId} />
        ) : (
          <AdminsTable universityId={user?.universityId} />
        )}
      </div>

      {/* Create Institute Modal */}
      <Dialog open={showCreateInstitute} onOpenChange={setShowCreateInstitute}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Create Institute for {user?.university?.name}
            </DialogTitle>
            <DialogDescription>
              Add a new institute/college to your university
            </DialogDescription>
          </DialogHeader>
          {user?.universityId && user?.university?.name && (
            <CreateInstituteForm 
              universityId={user.universityId}
              universityName={user.university.name}
              onSuccess={handleInstituteCreateSuccess}
              onCancel={() => setShowCreateInstitute(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Admin Modal */}
      <Dialog open={showCreateAdmin} onOpenChange={setShowCreateAdmin}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Create Admin for {user?.university?.name}
            </DialogTitle>
            <DialogDescription>
              Create a new administrator for your university
            </DialogDescription>
          </DialogHeader>
          {user?.universityId && user?.university?.name && (
            <CreateAdminForm 
              universityId={user.universityId}
              universityName={user.university.name}
              onSuccess={handleAdminCreateSuccess}
              onCancel={() => setShowCreateAdmin(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
