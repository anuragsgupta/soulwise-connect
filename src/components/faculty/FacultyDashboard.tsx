"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationBell from "@/components/notifications/NotificationBell";
import StudentWellnessInsights from "./StudentWellnessInsights";
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
  RotateCcw,
  UserCheck,
  Heart,
  MessageSquare,
  CalendarClock,
  Brain
} from "lucide-react";

const FacultyDashboard = () => {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWellnessInsights, setShowWellnessInsights] = useState(false);

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
      label: 'Manage Sessions', 
      icon: CalendarClock, 
      color: 'bg-blue-600 hover:bg-blue-700', 
      action: () => router.push('/faculty/sessions')
    },
    { 
      label: 'Wellness Insights', 
      icon: Brain, 
      color: 'bg-purple-600 hover:bg-purple-700', 
      action: () => setShowWellnessInsights(!showWellnessInsights)
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
    }
  ];

  const todaySchedule = [
    { time: '09:00 AM', student: 'Ananya Patel', type: 'Individual Session' },
    { time: '10:30 AM', student: 'Rohit Kumar', type: 'Crisis Support' },
    { time: '02:00 PM', student: 'Kavya Singh', type: 'Follow-up' },
    { time: '03:30 PM', student: 'Arjun Mehta', type: 'Group Session' }
  ];

  // Stats data for cards
  const stats = [
    {
      title: "Total Students",
      value: "247",
      change: "+12%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Crisis Alerts",
      value: "3",
      change: "-1 today",
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      title: "Scheduled Meetings",
      value: "8",
      change: "Today",
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: "Wellness Score",
      value: "87%",
      change: "+5%",
      icon: Heart,
      color: "text-purple-600"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      student: "Aarav Sharma",
      action: "Crisis Alert Triggered",
      time: "2 minutes ago",
      severity: "high",
      description: "Automatic SMS sent to emergency contact"
    },
    {
      id: 2,
      student: "Priya Patel",
      action: "Meeting Scheduled",
      time: "15 minutes ago",
      severity: "normal",
      description: "Academic counseling session for tomorrow"
    },
    {
      id: 3,
      student: "Rahul Gupta",
      action: "Mood Check-in",
      time: "1 hour ago",
      severity: "low",
      description: "Reported feeling anxious about exams"
    },
    {
      id: 4,
      student: "Sneha Reddy",
      action: "Resource Accessed",
      time: "2 hours ago",
      severity: "normal",
      description: "Downloaded stress management guide"
    }
  ];

  const upcomingMeetings = [
    {
      id: 1,
      student: "Arjun Singh",
      time: "10:00 AM",
      type: "Crisis Intervention",
      priority: "urgent"
    },
    {
      id: 2,
      student: "Kavya Nair",
      time: "2:00 PM", 
      type: "Regular Check-in",
      priority: "normal"
    },
    {
      id: 3,
      student: "Rohan Joshi",
      time: "4:00 PM",
      type: "Academic Counseling",
      priority: "normal"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Faculty Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-purple-100 text-purple-700 text-lg font-semibold">
                PS
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dr. Priya Sharma</h1>
              <p className="text-gray-600">Senior Mental Health Counselor</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <UserCheck className="h-3 w-3 mr-1" />
                  Available
                </Badge>
                <span className="text-sm text-gray-500">Manas University</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Current Time</p>
              <p className="text-lg font-semibold text-gray-900">{formatTime(currentTime)}</p>
            </div>
            <NotificationBell />
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs p-0 flex items-center justify-center">
                {mockStats.alertsToday}
              </Badge>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-600 mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                onClick={action.action}
                className={`h-20 flex-col space-y-2 ${action.color} text-white`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Wellness Insights Section */}
      {showWellnessInsights && (
        <StudentWellnessInsights />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaySchedule.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{session.student}</p>
                    <p className="text-xs text-gray-600">{session.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{session.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Latest student interactions and system alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.student}
                    </p>
                    <Badge className={getSeverityColor(activity.severity)}>
                      {activity.action}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Today's Meetings Overview */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Today's Meetings Overview
          </CardTitle>
          <CardDescription>
            Quick view of scheduled appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Clock className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {meeting.student}
                    </p>
                    <p className="text-sm text-gray-600">
                      {meeting.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {meeting.time}
                  </p>
                  <Badge className={getPriorityColor(meeting.priority)}>
                    {meeting.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyDashboard;