"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import FacultyDashboardNew from "@/components/faculty/FacultyDashboardNew";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LogOut,
  Brain
} from "lucide-react";

const FacultyPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    // Redirect non-faculty users to appropriate dashboard
    if (!isLoading && user && user.userType !== 'FACULTY') {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-token');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    // Redirect to login page
    router.push('/login');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not faculty
  if (!user || user.userType !== 'FACULTY') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo and Logout */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mann Mitra</h1>
                <p className="text-sm text-gray-600">Faculty Dashboard</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <FacultyDashboardNew />
      </div>
    </div>
  );
};

export default FacultyPage;