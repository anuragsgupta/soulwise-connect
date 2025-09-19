'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import AdminDashboard from '@/components/admin/AdminDashboard';

interface User {
  userType: 'student' | 'admin';
  email: string;
  role?: string;
  universityId?: string;
  instituteId?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        router.push('/auth/login');
      }
    } else {
      router.push('/auth/login');
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) {
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

  // Render appropriate dashboard based on user type
  if (user.userType === 'admin') {
    return <AdminDashboard userRole={user.role || 'Admin'} onLogout={handleLogout} />;
  }

  return <StudentDashboard onLogout={handleLogout} />;
}