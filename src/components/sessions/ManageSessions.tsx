"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  CalendarClock, 
  Eye,
  RotateCcw,
  MessageSquare,
  Phone,
  Mail,
  GraduationCap
} from "lucide-react";

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
  student: {
    id: string;
    name: string;
    email: string;
    enrollmentId: string;
    rollNumber: string | null;
    currentSemester: number;
    phone: string | null;
    department: {
      id: string;
      name: string;
      code: string;
    };
    batch: {
      id: string;
      name: string;
    };
    mentor: {
      id: string;
      name: string;
    } | null;
  };
}

interface ManageSessionsProps {
  onSessionUpdate?: () => void;
}

export default function ManageSessions({ onSessionUpdate }: ManageSessionsProps = {}) {
  const [sessions, setSessions] = useState<SessionBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SessionBooking | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'reschedule' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state for actions
  const [actionData, setActionData] = useState({
    facultyNotes: "",
    rejectionReason: "",
    scheduledDate: "",
    scheduledTime: "",
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/sessions', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setSessions(data.data.sessions);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSession = async (session: SessionBooking) => {
    try {

      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'complete',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Session marked as completed",
        });
        loadSessions();
        onSessionUpdate?.();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to complete session",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error completing session:', error);
      toast({
        title: "Error",
        description: "Failed to complete session",
        variant: "destructive",
      });
    }
  };

  const handleAction = async () => {
    if (!selectedSession || !actionType) return;

    try {
      setSubmitting(true);

      const payload: any = {
        action: actionType,
      };

      if (actionType === 'reject') {
        if (!actionData.rejectionReason) {
          toast({
            title: "Error",
            description: "Please provide a rejection reason",
            variant: "destructive",
          });
          return;
        }
        payload.rejectionReason = actionData.rejectionReason;
      }

      if (actionType === 'reschedule') {
        if (!actionData.scheduledDate || !actionData.scheduledTime) {
          toast({
            title: "Error",
            description: "Please provide new date and time",
            variant: "destructive",
          });
          return;
        }
        payload.scheduledDate = actionData.scheduledDate;
        payload.scheduledTime = actionData.scheduledTime;
      }

      if (actionData.facultyNotes) {
        payload.facultyNotes = actionData.facultyNotes;
      }

      const response = await fetch(`/api/sessions/${selectedSession.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: `Session ${actionType}d successfully`,
        });
        setShowActionDialog(false);
        setShowDetailsDialog(false);
        resetActionForm();
        loadSessions();
        onSessionUpdate?.();
      } else {
        toast({
          title: "Error",
          description: data.message || `Failed to ${actionType} session`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error ${actionType}ing session:`, error);
      toast({
        title: "Error",
        description: `Failed to ${actionType} session`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetActionForm = () => {
    setActionData({
      facultyNotes: "",
      rejectionReason: "",
      scheduledDate: "",
      scheduledTime: "",
    });
    setActionType(null);
  };

  const openActionDialog = (session: SessionBooking, action: 'approve' | 'reject' | 'reschedule') => {
    setSelectedSession(session);
    setActionType(action);
    setActionData({
      ...actionData,
      scheduledDate: session.scheduledDate.split('T')[0],
      scheduledTime: session.scheduledTime,
    });
    setShowActionDialog(true);
  };

  const viewDetails = (session: SessionBooking) => {
    setSelectedSession(session);
    setShowDetailsDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; icon: any; className?: string }> = {
      PENDING: { variant: "secondary", icon: Clock, className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
      APPROVED: { variant: "default", icon: CheckCircle, className: "bg-green-100 text-green-700 border-green-200" },
      REJECTED: { variant: "destructive", icon: XCircle },
      RESCHEDULED: { variant: "outline", icon: RotateCcw, className: "bg-blue-100 text-blue-700 border-blue-200" },
      COMPLETED: { variant: "secondary", icon: CheckCircle },
      CANCELLED: { variant: "outline", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className || ''}`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const filterSessions = (status?: string) => {
    if (!status) return sessions;
    return sessions.filter(s => s.status === status);
  };

  const renderSessionCard = (session: SessionBooking) => (
    <Card key={session.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{session.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <User className="h-4 w-4" />
              {session.student.name} • {session.student.enrollmentId}
            </CardDescription>
          </div>
          {getStatusBadge(session.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(session.scheduledDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{session.scheduledTime}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span>{session.student.department.name}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{session.sessionType.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {session.studentNotes && (
          <div className="bg-muted p-3 rounded-md">
            <p className="text-xs font-medium mb-1">Student Notes:</p>
            <p className="text-sm text-muted-foreground line-clamp-2">{session.studentNotes}</p>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => viewDetails(session)}>
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
          
          {session.status === 'PENDING' && (
            <>
              <Button 
                size="sm" 
                onClick={() => openActionDialog(session, 'approve')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => openActionDialog(session, 'reject')}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => openActionDialog(session, 'reschedule')}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reschedule
              </Button>
            </>
          )}

          {(session.status === 'APPROVED' || session.status === 'RESCHEDULED') && (
            <Button 
              size="sm"
              onClick={() => handleCompleteSession(session)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Session Management
          </CardTitle>
          <CardDescription>
            View and manage student session requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="pending">
                Pending ({filterSessions('PENDING').length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({filterSessions('APPROVED').length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({filterSessions('COMPLETED').length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({filterSessions('REJECTED').length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({sessions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {filterSessions('PENDING').length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filterSessions('PENDING').map(renderSessionCard)}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarClock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending sessions</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-4">
              {filterSessions('APPROVED').length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filterSessions('APPROVED').map(renderSessionCard)}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarClock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No approved sessions</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-4">
              {filterSessions('COMPLETED').length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filterSessions('COMPLETED').map(renderSessionCard)}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarClock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No completed sessions</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4 mt-4">
              {filterSessions('REJECTED').length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filterSessions('REJECTED').map(renderSessionCard)}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarClock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No rejected sessions</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4 mt-4">
              {sessions.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {sessions.map(renderSessionCard)}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarClock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sessions found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>
              Complete information about the session and student
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-6 py-4">
              {/* Session Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CalendarClock className="h-5 w-5" />
                  Session Information
                </h3>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Title</p>
                      <p className="font-medium">{selectedSession.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">{selectedSession.sessionType.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{new Date(selectedSession.scheduledDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">{selectedSession.scheduledTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{selectedSession.duration} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedSession.status)}</div>
                    </div>
                  </div>
                  {selectedSession.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="font-medium">{selectedSession.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Student Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </h3>
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedSession.student.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Enrollment ID</p>
                      <p className="font-medium">{selectedSession.student.enrollmentId}</p>
                    </div>
                    {selectedSession.student.rollNumber && (
                      <div>
                        <p className="text-sm text-muted-foreground">Roll Number</p>
                        <p className="font-medium">{selectedSession.student.rollNumber}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Semester</p>
                      <p className="font-medium">{selectedSession.student.currentSemester}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">{selectedSession.student.department.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Batch</p>
                      <p className="font-medium">{selectedSession.student.batch.name}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    {selectedSession.student.email && (
                      <a 
                        href={`mailto:${selectedSession.student.email}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Mail className="h-4 w-4" />
                        {selectedSession.student.email}
                      </a>
                    )}
                    {selectedSession.student.phone && (
                      <a 
                        href={`tel:${selectedSession.student.phone}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {selectedSession.student.phone}
                      </a>
                    )}
                  </div>

                  {selectedSession.student.mentor && (
                    <div>
                      <p className="text-sm text-muted-foreground">Mentor</p>
                      <p className="font-medium">{selectedSession.student.mentor.name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedSession.studentNotes && (
                <div>
                  <h3 className="font-semibold mb-2">Student Notes</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">{selectedSession.studentNotes}</p>
                  </div>
                </div>
              )}

              {selectedSession.facultyNotes && (
                <div>
                  <h3 className="font-semibold mb-2">Your Notes</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">{selectedSession.facultyNotes}</p>
                  </div>
                </div>
              )}

              {selectedSession.rejectionReason && (
                <div>
                  <h3 className="font-semibold mb-2 text-destructive">Rejection Reason</h3>
                  <div className="bg-destructive/10 p-4 rounded-lg">
                    <p className="text-sm text-destructive">{selectedSession.rejectionReason}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Session'}
              {actionType === 'reject' && 'Reject Session'}
              {actionType === 'reschedule' && 'Reschedule Session'}
            </DialogTitle>
            <DialogDescription>
              {selectedSession?.title} with {selectedSession?.student.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {actionType === 'reject' && (
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectionReason"
                  value={actionData.rejectionReason}
                  onChange={(e) => setActionData({ ...actionData, rejectionReason: e.target.value })}
                  placeholder="Please provide a reason for rejection"
                  rows={3}
                />
              </div>
            )}

            {actionType === 'reschedule' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newDate">New Date *</Label>
                  <Input
                    id="newDate"
                    type="date"
                    value={actionData.scheduledDate}
                    onChange={(e) => setActionData({ ...actionData, scheduledDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newTime">New Time *</Label>
                  <Input
                    id="newTime"
                    type="time"
                    value={actionData.scheduledTime}
                    onChange={(e) => setActionData({ ...actionData, scheduledTime: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="facultyNotes">Notes (Optional)</Label>
              <Textarea
                id="facultyNotes"
                value={actionData.facultyNotes}
                onChange={(e) => setActionData({ ...actionData, facultyNotes: e.target.value })}
                placeholder="Add any notes or comments"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction}
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
