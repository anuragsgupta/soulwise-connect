'use client';

import React, { useState, useEffect } from 'react';
import SuperAdminDashboard from './SuperAdminDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminDashboardProps {
  userRole: string;
  onLogout: () => void;
}

export default function AdminDashboard({ userRole, onLogout }: AdminDashboardProps) {
  // Route to specific admin dashboard based on role
  if (userRole === 'SuperAdmin') {
    return <SuperAdminDashboard onLogout={onLogout} />;
  }

  // Default admin dashboard for other roles
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-green-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm sm:text-base">Manage your institution and students</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-center">
                {userRole}
              </Badge>
              <Button variant="outline" onClick={onLogout} className="w-full sm:w-auto">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Overview of your institution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Students:</span>
                  <span className="font-semibold">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Faculty:</span>
                  <span className="font-semibold">56</span>
                </div>
                <div className="flex justify-between">
                  <span>Departments:</span>
                  <span className="font-semibold">12</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest updates and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="border-l-2 border-primary pl-3">
                  <p className="font-medium">New student registrations</p>
                  <p className="text-muted-foreground">25 new students registered today</p>
                </div>
                <div className="border-l-2 border-blue-500 pl-3">
                  <p className="font-medium">Faculty updates</p>
                  <p className="text-muted-foreground">3 faculty profiles updated</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  Add New Student
                </Button>
                <Button className="w-full" variant="outline">
                  Manage Faculty
                </Button>
                <Button className="w-full" variant="outline">
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional sections for role-specific functionality */}
        {userRole === 'UniversityAdmin' && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>University Management</CardTitle>
                <CardDescription>Manage institutes and university-wide settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline">Manage Institutes</Button>
                  <Button variant="outline">University Settings</Button>
                  <Button variant="outline">Institute Admins</Button>
                  <Button variant="outline">Reports & Analytics</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {userRole === 'InstituteAdmin' && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Institute Management</CardTitle>
                <CardDescription>Manage students, faculty, and institute settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline">Student Management</Button>
                  <Button variant="outline">Faculty Management</Button>
                  <Button variant="outline">Course Management</Button>
                  <Button variant="outline">Bulk Operations</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {userRole === 'Faculty' && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Faculty Dashboard</CardTitle>
                <CardDescription>Manage your courses and student interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline">My Courses</Button>
                  <Button variant="outline">Student Roster</Button>
                  <Button variant="outline">Assignments</Button>
                  <Button variant="outline">Grade Management</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
