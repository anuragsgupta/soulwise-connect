"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  Calendar, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw
} from "lucide-react";
import UpcomingMeetingsTable from "./UpcomingMeetingsTable";
import StudentAnalytics from "./StudentAnalytics";

interface FacultyData {
  name: string;
  email: string;
  department: string;
  profileImage: string;
}

const facultyInfo = {
  name: "Dr. Priya Sharma",
  email: "priya.sharma@university.edu",
  department: "Psychology",
  profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face"
};

const FacultyDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeView, setActiveView] = useState<'overview' | 'meetings' | 'analytics'>('overview');
  
  const facultyData = facultyInfo;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const mockStats = {
    totalStudents: 156,
    activeToday: 23,
    pendingMeetings: 8,
    alertsToday: 3,
    completedSessions: 12
  };

  const quickActions = [
    { 
      label: 'Schedule Meeting', 
      icon: Calendar, 
      color: 'bg-blue-600 hover:bg-blue-700', 
      action: () => console.log('Schedule meeting') 
    },
    { 
      label: 'View Alerts', 
      icon: AlertTriangle, 
      color: 'bg-red-600 hover:bg-red-700', 
      action: () => console.log('View alerts') 
    },
    { 
      label: 'Student Reports', 
      icon: Users, 
      color: 'bg-green-600 hover:bg-green-700', 
      action: () => console.log('Student reports') 
    },
    { 
      label: 'Add Notes', 
      icon: Plus, 
      color: 'bg-purple-600 hover:bg-purple-700', 
      action: () => console.log('Add notes') 
    }
  ];

  const todaySchedule = [
    { time: '09:00 AM', student: 'Ananya Patel', type: 'Individual Session' },
    { time: '10:30 AM', student: 'Rohit Kumar', type: 'Crisis Support' },
    { time: '02:00 PM', student: 'Kavya Singh', type: 'Follow-up' },
    { time: '03:30 PM', student: 'Arjun Mehta', type: 'Group Session' }
  ];

  const recentActivity = [
    { action: 'Crisis alert resolved', student: 'Priyanka Verma', time: '15 mins ago', type: 'alert' },
    { action: 'Session completed', student: 'Vikram Gupta', time: '1 hour ago', type: 'session' },
    { action: 'Meeting scheduled', student: 'Sneha Iyer', time: '2 hours ago', type: 'meeting' },
    { action: 'Report submitted', student: 'Aarav Joshi', time: '3 hours ago', type: 'report' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'alert': return AlertTriangle;
      case 'session': return CheckCircle;
      case 'meeting': return Calendar;
      case 'report': return Eye;
      default: return CheckCircle;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'alert': return 'text-red-600 bg-red-50';
      case 'session': return 'text-green-600 bg-green-50';
      case 'meeting': return 'text-blue-600 bg-blue-50';
      case 'report': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Faculty Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={facultyData.profileImage} />
                <AvatarFallback className="bg-blue-500 text-white text-lg">
                  {facultyData.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{facultyData.name}</h1>
                <p className="text-gray-600">{facultyData.department} Department</p>
                <p className="text-sm text-gray-500">{facultyData.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Current Time</p>
                <p className="text-lg font-semibold text-gray-900">{formatTime(currentTime)}</p>
              </div>
              <Button variant="outline" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs p-0 flex items-center justify-center">
                  {mockStats.alertsToday}
                </Badge>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview', icon: TrendingUp },
              { key: 'meetings', label: 'Meetings', icon: Calendar },
              { key: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveView(key as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeView === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={index}
                        onClick={action.action}
                        className={`${action.color} text-white p-4 h-auto flex flex-col items-center space-y-2`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{action.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900">{mockStats.totalStudents}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Today</p>
                        <p className="text-2xl font-bold text-green-600">{mockStats.activeToday}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Meetings</p>
                        <p className="text-2xl font-bold text-orange-600">{mockStats.pendingMeetings}</p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Alerts Today</p>
                        <p className="text-2xl font-bold text-red-600">{mockStats.alertsToday}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Sessions Done</p>
                        <p className="text-2xl font-bold text-purple-600">{mockStats.completedSessions}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Today's Schedule and Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Today's Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {todaySchedule.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{item.student}</p>
                            <p className="text-sm text-gray-600">{item.type}</p>
                          </div>
                          <Badge variant="outline">{item.time}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentActivity.map((activity, index) => {
                        const Icon = getActivityIcon(activity.type);
                        return (
                          <div key={index} className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                              <p className="text-xs text-gray-600">{activity.student} • {activity.time}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeView === 'meetings' && (
            <UpcomingMeetingsTable />
          )}

          {activeView === 'analytics' && (
            <StudentAnalytics />
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;