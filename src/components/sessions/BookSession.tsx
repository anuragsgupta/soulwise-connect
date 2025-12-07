"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, User, BookOpen, MessageSquare, CheckCircle, XCircle, RotateCcw, CalendarClock } from "lucide-react";

interface Faculty {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  facultyType: string;
  availabilityStatus: string;
  yearsOfExperience: number | null;
  department: {
    id: string;
    name: string;
    code: string;
  };
}

interface SessionBooking {
  id: string;
  sessionType: string;
  title: string;
  description: string | null;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: string;
  meetingLink: string | null;
  location: string | null;
  studentNotes: string | null;
  facultyNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  faculty: {
    id: string;
    name: string;
    email: string;
    jobTitle: string | null;
  };
}

export default function BookSession() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [sessions, setSessions] = useState<SessionBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    sessionType: "",
    title: "",
    description: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: 30,
    studentNotes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log('loadData called');
    try {
      setLoading(true);
      
      // Fetch available faculty - rely on cookie authentication
      console.log('Fetching faculty...');
      const facultyResponse = await fetch('/api/sessions/faculty', {
        credentials: 'include', // Use cookie for auth
      });
      
      console.log('Faculty API response status:', facultyResponse.status);
      
      if (!facultyResponse.ok) {
        const errorText = await facultyResponse.text();
        console.error('Faculty API error:', facultyResponse.status, errorText);
        toast({
          title: "Error",
          description: `Failed to load faculty (${facultyResponse.status})`,
          variant: "destructive",
        });
      } else {
        const facultyData = await facultyResponse.json();
        console.log('Faculty API response:', facultyData);
        
        if (facultyData.success) {
          console.log('Setting faculties:', facultyData.data.faculties.length, 'faculty members');
          setFaculties(facultyData.data.faculties);
        } else {
          console.error('Faculty API returned success=false:', facultyData.message);
          toast({
            title: "Error",
            description: facultyData.message || "Failed to load faculty",
            variant: "destructive",
          });
        }
      }

      // Fetch existing sessions
      const sessionsResponse = await fetch('/api/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!sessionsResponse.ok) {
        const errorText = await sessionsResponse.text();
        console.error('Sessions API error:', sessionsResponse.status, errorText);
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            toast({
              title: "Sessions Error",
              description: errorData.message,
              variant: "destructive",
            });
          }
        } catch (e) {
          // Failed to parse error as JSON
        }
      } else {
        const sessionsData = await sessionsResponse.json();
        
        if (sessionsData.success) {
          setSessions(sessionsData.data.sessions);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async () => {
    if (!selectedFaculty) return;

    try {
      setSubmitting(true);

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Use cookie for auth
        body: JSON.stringify({
          facultyId: selectedFaculty.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Session booked successfully",
        });
        setShowBookingDialog(false);
        resetForm();
        loadData();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to book session",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: "Error",
        description: "Failed to book session",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      sessionType: "",
      title: "",
      description: "",
      scheduledDate: "",
      scheduledTime: "",
      duration: 30,
      studentNotes: "",
    });
    setSelectedFaculty(null);
  };

  const openBookingDialog = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setShowBookingDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; icon: any }> = {
      PENDING: { variant: "secondary", icon: Clock },
      APPROVED: { variant: "default", icon: CheckCircle },
      REJECTED: { variant: "destructive", icon: XCircle },
      RESCHEDULED: { variant: "outline", icon: RotateCcw },
      COMPLETED: { variant: "secondary", icon: CheckCircle },
      CANCELLED: { variant: "outline", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getFacultyTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      HOD: "bg-purple-100 text-purple-700 border-purple-200",
      MENTOR_SUPERVISOR: "bg-blue-100 text-blue-700 border-blue-200",
      MENTOR: "bg-green-100 text-green-700 border-green-200",
      FACULTY: "bg-gray-100 text-gray-700 border-gray-200",
      COUNSELOR: "bg-pink-100 text-pink-700 border-pink-200",
    };

    return (
      <Badge variant="outline" className={colors[type] || colors.FACULTY}>
        {type.replace(/_/g, ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-purple-600 absolute inset-0"></div>
        </div>
        <p className="text-gray-600 font-semibold animate-pulse">Loading appointments...</p>
      </div>
    );
  }

  console.log('Rendering BookSession with faculties:', faculties.length, faculties);

  return (
    <div className="space-y-8 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05),rgba(255,255,255,0))] pointer-events-none" />
      {/* Available Faculty */}
      <Card className="relative border-0 shadow-xl rounded-3xl overflow-hidden bg-white/95 backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <CardHeader className="relative pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            Available Faculty & Mentors
          </CardTitle>
          <CardDescription className="text-base text-gray-600 mt-2 font-medium">
            Book a session with faculty members, mentors, or HODs from your institute
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {faculties.map((faculty) => (
              <Card key={faculty.id} className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-gray-200/60 rounded-2xl overflow-hidden bg-white hover:border-transparent">
                <CardHeader className="pb-4 bg-gradient-to-br from-gray-50/50 to-transparent">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {faculty.name.charAt(0)}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{faculty.name}</CardTitle>
                          <CardDescription className="text-sm font-medium text-gray-500">
                            {faculty.jobTitle || 'Faculty Member'}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    {getFacultyTypeBadge(faculty.facultyType)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                      <div className="p-1.5 rounded-lg bg-blue-100">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{faculty.department.name}</span>
                    </div>
                    {faculty.yearsOfExperience && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <span className="text-purple-600">📚</span>
                        <span>Experience: {faculty.yearsOfExperience} years</span>
                      </div>
                    )}
                  </div>
                  <Badge 
                    variant={faculty.availabilityStatus === 'AVAILABLE' ? 'default' : 'secondary'}
                    className={`w-full justify-center py-2 text-sm font-semibold ${
                      faculty.availabilityStatus === 'AVAILABLE' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' 
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {faculty.availabilityStatus === 'AVAILABLE' ? '✓ Available' : faculty.availabilityStatus}
                  </Badge>
                  <Button 
                    onClick={() => openBookingDialog(faculty)}
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105"
                    size="sm"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {faculties.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                <User className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-600 font-semibold text-lg">No faculty members available</p>
              <p className="text-gray-500 text-sm mt-2">Please check back later</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Sessions */}
      <Card className="relative border-0 shadow-xl rounded-3xl overflow-hidden bg-white/95 backdrop-blur-sm">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl" />
        <CardHeader className="relative pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-100 to-blue-100">
              <CalendarClock className="h-6 w-6 text-green-600" />
            </div>
            My Sessions
          </CardTitle>
          <CardDescription className="text-base text-gray-600 mt-2 font-medium">
            View and manage your booked sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="border border-gray-200/60 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white">
                <CardHeader className="bg-gradient-to-br from-gray-50/50 to-transparent pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-800 mb-2">{session.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {session.faculty.name.charAt(0)}
                        </div>
                        <CardDescription className="font-semibold text-gray-600">
                          with {session.faculty.name}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Date</p>
                        <p className="text-sm font-bold text-gray-800">{new Date(session.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <Clock className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Time & Duration</p>
                        <p className="text-sm font-bold text-gray-800">{session.scheduledTime} • {session.duration}min</p>
                      </div>
                    </div>
                  </div>

                  {session.description && (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-sm text-gray-700 leading-relaxed">{session.description}</p>
                    </div>
                  )}

                  {session.facultyNotes && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <p className="text-sm font-bold text-blue-800">Faculty Notes:</p>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{session.facultyNotes}</p>
                    </div>
                  )}

                  {session.rejectionReason && (
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <p className="text-sm font-bold text-red-800">Rejection Reason:</p>
                      </div>
                      <p className="text-sm text-red-700 leading-relaxed">{session.rejectionReason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {sessions.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-green-100 to-blue-100 mb-4">
                  <CalendarClock className="h-12 w-12 text-green-600" />
                </div>
                <p className="text-gray-800 font-bold text-lg">No sessions booked yet</p>
                <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">Book a session with your faculty or mentor to get started on your journey</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-0 shadow-2xl bg-white/98 backdrop-blur-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Book Session with {selectedFaculty?.name}</DialogTitle>
            <DialogDescription className="text-base text-gray-600 font-medium mt-2">
              {selectedFaculty?.jobTitle} • {selectedFaculty?.department.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="sessionType" className="text-sm font-semibold text-gray-700">Session Type *</Label>
              <Select
                value={formData.sessionType}
                onValueChange={(value) => setFormData({ ...formData, sessionType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COUNSELING">Counseling</SelectItem>
                  <SelectItem value="MENTORING">Mentoring</SelectItem>
                  <SelectItem value="ACADEMIC">Academic</SelectItem>
                  <SelectItem value="CAREER_GUIDANCE">Career Guidance</SelectItem>
                  <SelectItem value="PERSONAL">Personal</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Session Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Career guidance for internships"
                className="h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of what you'd like to discuss"
                rows={3}
                className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate" className="text-sm font-semibold text-gray-700">Preferred Date *</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledTime" className="text-sm font-semibold text-gray-700">Preferred Time *</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-semibold text-gray-700">Duration (minutes)</Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentNotes" className="text-sm font-semibold text-gray-700">Additional Notes</Label>
              <Textarea
                id="studentNotes"
                value={formData.studentNotes}
                onChange={(e) => setFormData({ ...formData, studentNotes: e.target.value })}
                placeholder="Any additional information you'd like to share"
                rows={3}
                className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowBookingDialog(false)}
              className="h-11 px-6 rounded-xl border-gray-300 hover:bg-gray-100 font-semibold"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBookSession}
              disabled={submitting || !formData.sessionType || !formData.title || !formData.scheduledDate || !formData.scheduledTime}
              className="h-11 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Booking...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Session
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
