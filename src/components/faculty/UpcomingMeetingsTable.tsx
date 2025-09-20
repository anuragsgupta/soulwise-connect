"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  AlertTriangle,
  Filter,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import MeetingActionModal from "./MeetingActionModal";

interface MeetingRequest {
  id: string;
  studentName: string;
  enrollmentId: string;
  studentAvatar?: string;
  preferredTime: Date;
  status: 'pending' | 'approved' | 'declined' | 'rescheduled';
  priority: 'normal' | 'high' | 'urgent';
  reason: string;
  submittedAt: Date;
}

const mockMeetings: MeetingRequest[] = [
  {
    id: "1",
    studentName: "Ananya Patel",
    enrollmentId: "CS2021001",
    preferredTime: new Date('2024-01-16T10:00:00'),
    status: 'pending',
    priority: 'high',
    reason: "Experiencing anxiety about upcoming exams and need guidance on stress management techniques.",
    submittedAt: new Date('2024-01-15T09:30:00')
  },
  {
    id: "2",
    studentName: "Rohit Kumar", 
    enrollmentId: "CS2021002",
    preferredTime: new Date('2024-01-16T14:30:00'),
    status: 'pending',
    priority: 'urgent',
    reason: "Having thoughts of self-harm and need immediate support and counseling.",
    submittedAt: new Date('2024-01-15T11:15:00')
  },
  {
    id: "3",
    studentName: "Kavya Singh",
    enrollmentId: "CS2021003",
    preferredTime: new Date('2024-01-17T11:00:00'),
    status: 'pending',
    priority: 'normal',
    reason: "Relationship issues affecting academic performance, seeking advice.",
    submittedAt: new Date('2024-01-15T13:45:00')
  },
  {
    id: "4",
    studentName: "Arjun Mehta",
    enrollmentId: "CS2021004",
    preferredTime: new Date('2024-01-16T09:00:00'),
    status: 'approved',
    priority: 'normal',
    reason: "Follow-up session for anxiety management progress check.",
    submittedAt: new Date('2024-01-14T16:20:00')
  }
];

const UpcomingMeetingsTable = () => {
  const [meetings, setMeetings] = useState<MeetingRequest[]>(mockMeetings);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'decline' | 'reschedule' | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.enrollmentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingMeetings = filteredMeetings.filter(m => m.status === 'pending');
  const approvedMeetings = filteredMeetings.filter(m => m.status === 'approved');

  const handleAction = (meeting: MeetingRequest, type: 'approve' | 'decline' | 'reschedule') => {
    setSelectedMeeting(meeting);
    setActionType(type);
  };

  const handleConfirmAction = (updatedMeeting: MeetingRequest) => {
    setMeetings(prev => prev.map(m => m.id === updatedMeeting.id ? updatedMeeting : m));
    setSelectedMeeting(null);
    setActionType(null);
  };

  const handleCancelAction = () => {
    setSelectedMeeting(null);
    setActionType(null);
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      normal: { color: "bg-gray-100 text-gray-800", icon: "" },
      high: { color: "bg-orange-100 text-orange-800", icon: "⚠️" },
      urgent: { color: "bg-red-100 text-red-800", icon: "🚨" }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    
    return (
      <Badge className={`${config.color} text-xs`}>
        {config.icon} {priority.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      approved: { color: "bg-green-100 text-green-800", text: "Approved" },
      declined: { color: "bg-red-100 text-red-800", text: "Declined" },
      rescheduled: { color: "bg-blue-100 text-blue-800", text: "Rescheduled" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    
    return (
      <Badge className={`${config.color} text-xs`}>
        {config.text}
      </Badge>
    );
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const MeetingRow = ({ meeting }: { meeting: MeetingRequest }) => (
    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarImage src={meeting.studentAvatar} />
            <AvatarFallback className="bg-blue-500 text-white">
              {meeting.studentName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="font-semibold text-gray-900">{meeting.studentName}</h4>
              <span className="text-sm text-gray-600">{meeting.enrollmentId}</span>
              {getPriorityBadge(meeting.priority)}
              {getStatusBadge(meeting.status)}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDateTime(meeting.preferredTime)}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Submitted {formatDateTime(meeting.submittedAt)}
              </div>
            </div>
            
            <p className="text-sm text-gray-700 line-clamp-2">{meeting.reason}</p>
          </div>
        </div>

        {meeting.status === 'pending' && (
          <div className="flex space-x-2 ml-4">
            <Button
              size="sm"
              onClick={() => handleAction(meeting, 'approve')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction(meeting, 'reschedule')}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reschedule
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction(meeting, 'decline')}
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Decline
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by student name or enrollment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingMeetings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
              Pending Meeting Requests ({pendingMeetings.length})
            </CardTitle>
            <CardDescription>
              These requests require your attention and approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingMeetings.map((meeting) => (
                <MeetingRow key={meeting.id} meeting={meeting} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Meetings */}
      {approvedMeetings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Approved Meetings ({approvedMeetings.length})
            </CardTitle>
            <CardDescription>
              Confirmed meetings scheduled with students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvedMeetings.map((meeting) => (
                <MeetingRow key={meeting.id} meeting={meeting} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {filteredMeetings.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No meetings found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search criteria" 
                : "No meeting requests at the moment"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Modal */}
      {selectedMeeting && actionType && (
        <MeetingActionModal
          meeting={selectedMeeting}
          actionType={actionType}
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
        />
      )}
    </div>
  );
};

export default UpcomingMeetingsTable;