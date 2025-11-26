'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserCog, Mail, Phone, MapPin, Building2, Shield } from 'lucide-react';

interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  adminType: string;
  status: string;
  isSuperAdmin: boolean;
  universityId?: string;
  instituteId?: string;
  university?: {
    id: string;
    name: string;
  };
  institute?: {
    id: string;
    name: string;
    code: string;
    universityId?: string;
    university?: {
      id: string;
      name: string;
    };
  };
  createdAt: string;
}

interface AdminsTableProps {
  universityId?: string;
  instituteId?: string;
}

export default function AdminsTable({ universityId, instituteId }: AdminsTableProps) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    loadAdmins();
  }, [universityId, instituteId]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/admins', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      
      if (result.success) {
        let filteredAdmins = result.data.admins;
        
        // Filter by instituteId if provided
        if (instituteId) {
          filteredAdmins = filteredAdmins.filter((admin: Admin) => admin.institute?.id === instituteId);
        }
        // Filter by universityId if provided (includes university admins and institute admins under that university)
        else if (universityId) {
          filteredAdmins = filteredAdmins.filter((admin: Admin) => {
            // Include university admins for this university
            if (admin.adminType === 'UNIVERSITY_ADMIN' && admin.university?.id === universityId) {
              return true;
            }
            // Include institute admins whose institute is under this university
            if (admin.adminType === 'INSTITUTE_ADMIN' && admin.institute?.university?.id === universityId) {
              return true;
            }
            return false;
          });
        }
        
        setAdmins(filteredAdmins);
      }
    } catch (error) {
      console.error('Failed to load admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAdminTypeBadge = (adminType: string, isSuperAdmin: boolean) => {
    if (isSuperAdmin) {
      return <Badge className="bg-purple-600">Super Admin</Badge>;
    }
    
    switch (adminType) {
      case 'UNIVERSITY_ADMIN':
        return <Badge className="bg-blue-600">University Admin</Badge>;
      case 'INSTITUTE_ADMIN':
        return <Badge className="bg-green-600">Institute Admin</Badge>;
      default:
        return <Badge variant="outline">{adminType}</Badge>;
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
              <CardTitle>Administrators</CardTitle>
              <CardDescription>All system administrators</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No administrators found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      {admin.isSuperAdmin ? (
                        <Shield className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <UserCog className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{admin.name}</h3>
                          {getAdminTypeBadge(admin.adminType, admin.isSuperAdmin)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {admin.email}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground mt-2">
                          {admin.university && (
                            <>
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {admin.university.name}
                              </span>
                            </>
                          )}
                          {admin.institute && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="flex items-center gap-1 text-xs">
                                Institute: {admin.institute.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={admin.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {admin.status}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedAdmin(admin)}
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

      {/* Admin Details Modal */}
      <Dialog open={selectedAdmin !== null} onOpenChange={(open) => !open && setSelectedAdmin(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAdmin?.isSuperAdmin ? (
                <Shield className="h-5 w-5 text-purple-600" />
              ) : (
                <UserCog className="h-5 w-5 text-primary" />
              )}
              {selectedAdmin?.name}
            </DialogTitle>
            <DialogDescription>
              Administrator details and information
            </DialogDescription>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Admin Type</Label>
                  <div className="mt-1">
                    {getAdminTypeBadge(selectedAdmin.adminType, selectedAdmin.isSuperAdmin)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <p className="mt-1">
                    <Badge variant={selectedAdmin.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {selectedAdmin.status}
                    </Badge>
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </Label>
                  <p className="mt-1 text-sm">{selectedAdmin.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone
                  </Label>
                  <p className="mt-1 text-sm">{selectedAdmin.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                  <p className="mt-1 text-sm">
                    {new Date(selectedAdmin.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Address
                  </Label>
                  <p className="mt-1 text-sm">{selectedAdmin.address}</p>
                </div>
                {selectedAdmin.university && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      University
                    </Label>
                    <p className="mt-1 text-sm font-medium">{selectedAdmin.university.name}</p>
                  </div>
                )}
                {selectedAdmin.institute && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Institute</Label>
                    <p className="mt-1 text-sm">
                      {selectedAdmin.institute.name} ({selectedAdmin.institute.code})
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedAdmin(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
