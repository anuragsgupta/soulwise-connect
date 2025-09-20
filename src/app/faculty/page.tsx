"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FacultyDashboard from "@/components/faculty/FacultyDashboard";
import StudentAnalytics from "@/components/faculty/StudentAnalytics";
import UpcomingMeetingsTable from "@/components/faculty/UpcomingMeetingsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  Calendar, 
  Users, 
  MessageSquare,
  LogOut,
  Brain
} from "lucide-react";

const FacultyPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    // Redirect to login page
    router.push('/login');
  };

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto lg:mx-0">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="meetings" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Meetings</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <FacultyDashboard />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <StudentAnalytics />
          </TabsContent>

          <TabsContent value="meetings" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Meeting Management</h1>
                <p className="text-gray-600 mt-1">
                  Manage student meeting requests and appointments
                </p>
              </div>
              <div className="p-6">
                <UpcomingMeetingsTable />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages Coming Soon</h3>
                <p className="text-gray-600">
                  Direct messaging with students and crisis alerts will be available here.
                </p>
              </div>
            </div>
          </TabsContent>
          
        </Tabs>
      </div>
    </div>
  );
};

export default FacultyPage;