"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Heart,
  Brain,
  MessageSquare,
  Calendar,
  Download,
  Filter
} from "lucide-react";

interface StudentAnalytics {
  totalStudents: number;
  activeStudents: number;
  atRiskStudents: number;
  completedSessions: number;
  pendingAppointments: number;
  avgSessionsPerStudent: number;
  moodTrends: {
    excellent: number;
    good: number;
    neutral: number;
    poor: number;
    critical: number;
  };
  weeklyActivity: Array<{
    day: string;
    sessions: number;
    moodAvg: number;
  }>;
  topConcerns: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  recentAlerts: Array<{
    studentName: string;
    type: 'crisis' | 'mood' | 'absence';
    severity: 'low' | 'medium' | 'high';
    timestamp: Date;
  }>;
}

const mockAnalytics: StudentAnalytics = {
  totalStudents: 156,
  activeStudents: 142,
  atRiskStudents: 12,
  completedSessions: 89,
  pendingAppointments: 23,
  avgSessionsPerStudent: 3.2,
  moodTrends: {
    excellent: 15,
    good: 45,
    neutral: 25,
    poor: 12,
    critical: 3
  },
  weeklyActivity: [
    { day: 'Mon', sessions: 18, moodAvg: 3.2 },
    { day: 'Tue', sessions: 22, moodAvg: 3.4 },
    { day: 'Wed', sessions: 15, moodAvg: 3.1 },
    { day: 'Thu', sessions: 28, moodAvg: 3.6 },
    { day: 'Fri', sessions: 25, moodAvg: 3.8 },
    { day: 'Sat', sessions: 8, moodAvg: 3.5 },
    { day: 'Sun', sessions: 5, moodAvg: 3.3 }
  ],
  topConcerns: [
    { category: 'Academic Stress', count: 45, percentage: 32 },
    { category: 'Social Anxiety', count: 38, percentage: 27 },
    { category: 'Depression', count: 28, percentage: 20 },
    { category: 'Family Issues', count: 18, percentage: 13 },
    { category: 'Relationship Problems', count: 11, percentage: 8 }
  ],
  recentAlerts: [
    { studentName: 'Priyanka Verma', type: 'crisis', severity: 'high', timestamp: new Date('2024-01-15T10:30:00') },
    { studentName: 'Vikram Gupta', type: 'mood', severity: 'medium', timestamp: new Date('2024-01-15T09:15:00') },
    { studentName: 'Sneha Iyer', type: 'absence', severity: 'low', timestamp: new Date('2024-01-14T16:45:00') },
    { studentName: 'Aarav Joshi', type: 'crisis', severity: 'high', timestamp: new Date('2024-01-14T14:20:00') }
  ]
};

const StudentAnalytics = () => {
  const analytics = mockAnalytics;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'crisis': return AlertTriangle;
      case 'mood': return Heart;
      case 'absence': return Clock;
      default: return AlertTriangle;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'neutral': return 'bg-yellow-500';
      case 'poor': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Analytics</h2>
          <p className="text-gray-600">Overview of student mental health and engagement</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalStudents}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+5.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-3xl font-bold text-green-600">{analytics.activeStudents}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={(analytics.activeStudents / analytics.totalStudents) * 100} className="h-2" />
              <span className="text-sm text-gray-600 mt-1">
                {Math.round((analytics.activeStudents / analytics.totalStudents) * 100)}% engagement rate
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">At-Risk Students</p>
                <p className="text-3xl font-bold text-red-600">{analytics.atRiskStudents}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">-2 from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Meetings</p>
                <p className="text-3xl font-bold text-orange-600">{analytics.pendingAppointments}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-600">
                {analytics.completedSessions} completed this month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-pink-600" />
              Mood Distribution
            </CardTitle>
            <CardDescription>
              Current mood trends across all students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.moodTrends).map(([mood, percentage]) => (
                <div key={mood} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getMoodColor(mood)}`}></div>
                    <span className="text-sm font-medium capitalize">{mood}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getMoodColor(mood)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Weekly Activity
            </CardTitle>
            <CardDescription>
              Sessions and mood trends by day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.weeklyActivity.map((day, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${(day.sessions / 30) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{day.sessions}</span>
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm font-medium">
                      {day.moodAvg.toFixed(1)}★
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Concerns and Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Concerns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-600" />
              Top Concerns
            </CardTitle>
            <CardDescription>
              Most reported mental health concerns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topConcerns.map((concern, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{concern.category}</p>
                    <p className="text-sm text-gray-600">{concern.count} reports</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{concern.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-red-600" />
              Recent Alerts
            </CardTitle>
            <CardDescription>
              Latest system alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentAlerts.map((alert, index) => {
                const Icon = getAlertIcon(alert.type);
                return (
                  <div 
                    key={index} 
                    className={`flex items-center space-x-3 p-3 rounded-lg border ${getAlertColor(alert.severity)}`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.studentName}</p>
                      <p className="text-xs opacity-75 capitalize">
                        {alert.type} alert - {alert.severity} priority
                      </p>
                    </div>
                    <div className="text-xs opacity-75">
                      {alert.timestamp.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button variant="outline" size="sm" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                View All Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentAnalytics;