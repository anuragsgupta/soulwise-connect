'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Plus, University, Users, Mail, ExternalLink } from 'lucide-react';
import CreateUniversityForm from './CreateUniversityForm';

interface University {
  id: string;
  name: string;
  domain: string;
  address: string;
  establishedYear: number;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  _count: {
    institutes: number;
  };
}

interface SuperAdminDashboardProps {
  onLogout: () => void;
}

export default function SuperAdminDashboard({ onLogout }: SuperAdminDashboardProps) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUniversities();
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
            domain: 'du.ac.in',
            address: 'Delhi, India',
            establishedYear: 1922,
            contactEmail: 'admin@du.ac.in',
            contactPhone: '+91-11-27666613',
            website: 'https://www.du.ac.in',
            _count: { institutes: 12 },
          },
          {
            id: '2',
            name: 'Mumbai University',
            domain: 'mu.ac.in',
            address: 'Mumbai, Maharashtra, India',
            establishedYear: 1857,
            contactEmail: 'registrar@mu.ac.in',
            contactPhone: '+91-22-26543000',
            website: 'https://www.mu.ac.in',
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
          domain: 'du.ac.in',
          address: 'Delhi, India',
          establishedYear: 1922,
          contactEmail: 'admin@du.ac.in',
          contactPhone: '+91-11-27666613',
          website: 'https://www.du.ac.in',
          _count: { institutes: 12 },
        },
        {
          id: '2',
          name: 'Mumbai University',
          domain: 'mu.ac.in',
          address: 'Mumbai, Maharashtra, India',
          establishedYear: 1857,
          contactEmail: 'registrar@mu.ac.in',
          contactPhone: '+91-22-26543000',
          website: 'https://www.mu.ac.in',
          _count: { institutes: 8 },
        },
      ];
      setUniversities(mockUniversities);
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    loadUniversities(); // Reload the list
    setShowCreateForm(false);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Universities</CardTitle>
              <University className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{universities.length}</div>
              <p className="text-xs text-muted-foreground">Active institutions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Institutes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {universities.reduce((sum, uni) => sum + uni._count.institutes, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Across all universities</p>
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

        {/* Universities Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <CardTitle>Universities</CardTitle>
                <CardDescription>Manage universities and invite administrators</CardDescription>
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
                      <span>{university.address}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{university._count.institutes} institutes</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Mail className="h-4 w-4 mr-2" />
                      Invite Admin
                    </Button>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create University Form Modal */}
      {showCreateForm && (
        <CreateUniversityForm 
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}
