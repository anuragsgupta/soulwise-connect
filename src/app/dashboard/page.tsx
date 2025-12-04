'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only redirect once to prevent loops
    if (hasRedirected.current) return;

    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      hasRedirected.current = true;
      router.replace('/login'); // Use replace instead of push to prevent back button issues
      return;
    }

    // Redirect faculty users to their dedicated dashboard
    if (!isLoading && user?.userType === 'FACULTY') {
      hasRedirected.current = true;
      router.replace('/faculty'); // Use replace instead of push
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.replace('/'); // Use replace to clear navigation history
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Render appropriate dashboard based on user type and role
  if (user.userType === 'STUDENT') {
    return <StudentDashboard onLogout={handleLogout} />;
  }

  // Faculty users should be redirected by useEffect above
  // This is a fallback in case they navigate directly
  if (user.userType === 'FACULTY') {
    return null; // Will redirect to /faculty
  }

  // For admin roles (check adminType field from new schema)
  if (user.userType === 'ADMIN' && user.adminType) {
    const roleMap: Record<string, string> = {
      'SUPER_ADMIN': 'SuperAdmin',
      'UNIVERSITY_ADMIN': 'UniversityAdmin',
      'INSTITUTE_ADMIN': 'InstituteAdmin',
    };

    return <AdminDashboard userRole={roleMap[user.adminType] || 'Admin'} onLogout={handleLogout} />;
  }

  // Fallback for old schema or unknown types
  if (user.role) {
    const roleMap: Record<string, string> = {
      'SUPER_ADMIN': 'SuperAdmin',
      'UNIVERSITY_ADMIN': 'UniversityAdmin',
      'INSTITUTE_ADMIN': 'InstituteAdmin',
      'FACULTY': 'Faculty',
      'STUDENT': 'Student',
    };

    const mappedRole = roleMap[user.role];
    
    if (mappedRole === 'Student') {
      return <StudentDashboard onLogout={handleLogout} />;
    }

    return <AdminDashboard userRole={mappedRole || 'Admin'} onLogout={handleLogout} />;
  }

  // Default fallback
  return <AdminDashboard userRole="Admin" onLogout={handleLogout} />;
}
