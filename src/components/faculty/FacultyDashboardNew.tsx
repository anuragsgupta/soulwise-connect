"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Heart,
  Building2,
  Search,
  AlertTriangle,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  UserCircle
} from "lucide-react";
import ManageSessions from "@/components/sessions/ManageSessions";
import NotificationsPage from "@/components/notifications/NotificationsPage";
import StudentWellnessInsights from "./StudentWellnessInsights";

interface Analytics {
  totalStudents: number;
  pendingMeetings: number;
  avgWeeklyActivity: number;
  avgWeeklyMood: number;
  recentCrisisAlerts: number;
}

interface Faculty {
  name: string;
  email: string;
  facultyType: string;
  department: { id: string; name: string; code: string };
  institute: { id: string; name: string; code: string };
}

interface MoodLog {
  id: string;
  moodScore: number;
  moodLabel: string;
  notes: string | null;
  checkInDate: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
    rollNumber: string | null;
    department: { name: string };
  };
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  rollNumber: string | null;
  enrollmentId: string;
  currentSemester: number;
  cgpa: number | null;
  admissionYear: number;
  status: string;
  lastLogin: string | null;
  department: { id: string; name: string; code: string };
  batch: { id: string; name: string };
  mentor: { id: string; name: string } | null;
  _count: {
    moodCheckIns: number;
    sessionBookings: number;
    crisisAlerts: number;
  };
}

interface Department {
  id: string;
  name: string;
  code: string;
}

export default function FacultyDashboardNew() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [recentMoodLogs, setRecentMoodLogs] = useState<MoodLog[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === "students") {
      loadStudents();
    }
  }, [activeTab, searchTerm, selectedDepartment]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/faculty/analytics', {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data.analytics);
        setFaculty(data.data.faculty);
        setRecentMoodLogs(data.data.recentMoodLogs);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load analytics",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedDepartment && selectedDepartment !== 'all') params.append('departmentId', selectedDepartment);

      const response = await fetch(`/api/faculty/students?${params}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setStudents(data.data.students);
        setDepartments(data.data.departments);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const getMoodColor = (score: number) => {
    if (score >= 4) return "text-green-600 bg-green-50";
    if (score >= 3) return "text-blue-600 bg-blue-50";
    if (score >= 2) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getMoodEmoji = (label: string) => {
    const emojiMap: { [key: string]: string } = {
      'Excellent': '😊',
      'Good': '🙂',
      'Okay': '😐',
      'Low': '😔',
      'Very Low': '😢'
    };
    return emojiMap[label] || '😐';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      ACTIVE: "default",
      INACTIVE: "secondary",
      SUSPENDED: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{faculty?.name}</h1>
            <p className="text-gray-600 mt-1">{faculty?.facultyType.replace(/_/g, ' ')}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {faculty?.institute.name}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {faculty?.department.name}
              </span>
            </div>
          </div>
          <Badge className="h-fit" variant="outline">
            {faculty?.institute.code}
          </Badge>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalStudents}</div>
            <p className="text-xs text-muted-foreground">In your institute</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.pendingMeetings}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.avgWeeklyActivity}</div>
            <p className="text-xs text-muted-foreground">Avg daily actions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Mood Score</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.avgWeeklyMood}/10</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crisis Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics?.recentCrisisAlerts}</div>
            <p className="text-xs text-muted-foreground">High/Critical active</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/faculty/anonymous-mentoring/requests'}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <UserCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Anonymous Mentoring</CardTitle>
                  <CardDescription>View pending anonymous requests</CardDescription>
                </div>
              </div>
              <MessageSquare className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/faculty/anonymous-mentoring/sessions'}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Active Sessions</CardTitle>
                  <CardDescription>Manage anonymous chat sessions</CardDescription>
                </div>
              </div>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wellness">Wellness Insights</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Recent Mood Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Student Mood Logs</CardTitle>
              <CardDescription>Latest mood check-ins from students in your institute</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMoodLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${getMoodColor(log.moodScore)}`}>
                        {getMoodEmoji(log.moodLabel)}
                      </div>
                      <div>
                        <p className="font-medium">{log.student.name}</p>
                        <p className="text-sm text-gray-500">
                          {log.student.department.name} • {log.student.rollNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{log.moodLabel}</p>
                      <p className="text-sm text-gray-600">{log.moodScore}/5</p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.checkInDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {recentMoodLogs.length === 0 && (
                  <p className="text-center py-8 text-gray-500">No recent mood logs</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Student Directory</CardTitle>
              <CardDescription>All students in your institute</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or roll number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Students Table */}
              <div className="border rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-gray-500">{student.rollNumber || student.enrollmentId}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm">{student.department.name}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm">Sem {student.currentSemester}</p>
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(student.status)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 text-xs text-gray-500">
                              <span>{student._count.moodCheckIns} moods</span>
                              <span>•</span>
                              <span>{student._count.sessionBookings} sessions</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedStudent(student)}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {students.length === 0 && (
                  <p className="text-center py-8 text-gray-500">No students found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wellness" className="space-y-4">
          <StudentWellnessInsights />
        </TabsContent>

        <TabsContent value="sessions">
          <ManageSessions onSessionUpdate={loadAnalytics} />
        </TabsContent>
      </Tabs>

      {/* Student Details Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>Complete profile and activity information</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Roll Number</p>
                    <p className="font-medium">{selectedStudent.rollNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-sm">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedStudent.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div>
                <h3 className="font-semibold mb-3">Academic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{selectedStudent.department.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Batch</p>
                    <p className="font-medium">{selectedStudent.batch.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Semester</p>
                    <p className="font-medium">{selectedStudent.currentSemester}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">CGPA</p>
                    <p className="font-medium">{selectedStudent.cgpa || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Admission Year</p>
                    <p className="font-medium">{selectedStudent.admissionYear}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mentor</p>
                    <p className="font-medium">{selectedStudent.mentor?.name || 'Not Assigned'}</p>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div>
                <h3 className="font-semibold mb-3">Activity Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{selectedStudent._count.moodCheckIns}</p>
                        <p className="text-sm text-gray-500">Mood Check-ins</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{selectedStudent._count.sessionBookings}</p>
                        <p className="text-sm text-gray-500">Sessions Booked</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{selectedStudent._count.crisisAlerts}</p>
                        <p className="text-sm text-gray-500">Crisis Alerts</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="font-semibold mb-3">Status</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Account Status</p>
                    {getStatusBadge(selectedStudent.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="font-medium">
                      {selectedStudent.lastLogin 
                        ? new Date(selectedStudent.lastLogin).toLocaleString()
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
