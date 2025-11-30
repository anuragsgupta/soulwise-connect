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
      const token = localStorage.getItem('auth-token');
      console.log('Token:', token ? 'exists' : 'missing');
      
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view appointments",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Fetch available faculty
      console.log('Fetching faculty...');
      const facultyResponse = await fetch('/api/sessions/faculty', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
      const token = localStorage.getItem('auth-token');

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log('Rendering BookSession with faculties:', faculties.length, faculties);

  return (
    <div className="space-y-6">
      {/* Available Faculty */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Available Faculty & Mentors
          </CardTitle>
          <CardDescription>
            Book a session with faculty members, mentors, or HODs from your institute
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {faculties.map((faculty) => (
              <Card key={faculty.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{faculty.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {faculty.jobTitle || 'Faculty Member'}
                      </CardDescription>
                    </div>
                    {getFacultyTypeBadge(faculty.facultyType)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {faculty.department.name}
                    </p>
                    {faculty.yearsOfExperience && (
                      <p className="mt-1">
                        Experience: {faculty.yearsOfExperience} years
                      </p>
                    )}
                  </div>
                  <Badge 
                    variant={faculty.availabilityStatus === 'AVAILABLE' ? 'default' : 'secondary'}
                    className="w-full justify-center"
                  >
                    {faculty.availabilityStatus}
                  </Badge>
                  <Button 
                    onClick={() => openBookingDialog(faculty)}
                    className="w-full"
                    size="sm"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {faculties.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No faculty members available at the moment</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            My Sessions
          </CardTitle>
          <CardDescription>
            View and manage your booked sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      <CardDescription>
                        with {session.faculty.name}
                      </CardDescription>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(session.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{session.scheduledTime} ({session.duration} mins)</span>
                    </div>
                  </div>

                  {session.description && (
                    <p className="text-sm text-muted-foreground">{session.description}</p>
                  )}

                  {session.facultyNotes && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium mb-1">Faculty Notes:</p>
                      <p className="text-sm text-muted-foreground">{session.facultyNotes}</p>
                    </div>
                  )}

                  {session.rejectionReason && (
                    <div className="bg-destructive/10 p-3 rounded-md">
                      <p className="text-sm font-medium mb-1 text-destructive">Rejection Reason:</p>
                      <p className="text-sm text-destructive">{session.rejectionReason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {sessions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarClock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sessions booked yet</p>
                <p className="text-sm mt-2">Book a session with your faculty or mentor to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Session with {selectedFaculty?.name}</DialogTitle>
            <DialogDescription>
              {selectedFaculty?.jobTitle} • {selectedFaculty?.department.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sessionType">Session Type *</Label>
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
              <Label htmlFor="title">Session Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Career guidance for internships"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of what you'd like to discuss"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Preferred Date *</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Preferred Time *</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
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
              <Label htmlFor="studentNotes">Additional Notes</Label>
              <Textarea
                id="studentNotes"
                value={formData.studentNotes}
                onChange={(e) => setFormData({ ...formData, studentNotes: e.target.value })}
                placeholder="Any additional information you'd like to share"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBookSession}
              disabled={submitting || !formData.sessionType || !formData.title || !formData.scheduledDate || !formData.scheduledTime}
            >
              {submitting ? "Booking..." : "Book Session"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
