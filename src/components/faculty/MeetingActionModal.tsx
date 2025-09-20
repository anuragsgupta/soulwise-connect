"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Calendar,
  Clock,
  User,
  AlertTriangle
} from "lucide-react";

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

interface MeetingActionModalProps {
  meeting: MeetingRequest;
  actionType: 'approve' | 'decline' | 'reschedule';
  onConfirm: (updatedMeeting: MeetingRequest) => void;
  onCancel: () => void;
}

const MeetingActionModal = ({ meeting, actionType, onConfirm, onCancel }: MeetingActionModalProps) => {
  const [newDateTime, setNewDateTime] = useState(
    meeting.preferredTime.toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getActionConfig = () => {
    switch (actionType) {
      case 'approve':
        return {
          title: 'Approve Meeting Request',
          description: 'Confirm the meeting details and approve the request',
          icon: CheckCircle,
          iconColor: 'text-green-600',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          buttonText: 'Approve Meeting'
        };
      case 'decline':
        return {
          title: 'Decline Meeting Request',
          description: 'Provide a reason for declining this meeting request',
          icon: XCircle,
          iconColor: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          buttonText: 'Decline Request'
        };
      case 'reschedule':
        return {
          title: 'Reschedule Meeting',
          description: 'Suggest a new time for this meeting',
          icon: RotateCcw,
          iconColor: 'text-blue-600',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          buttonText: 'Reschedule Meeting'
        };
    }
  };

  const config = getActionConfig();
  const Icon = config.icon;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedMeeting: MeetingRequest = {
      ...meeting,
      status: actionType === 'approve' ? 'approved' : actionType === 'decline' ? 'declined' : 'rescheduled',
      ...(actionType === 'reschedule' && { preferredTime: new Date(newDateTime) })
    };

    onConfirm(updatedMeeting);
    setIsSubmitting(false);
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Icon className={`h-6 w-6 mr-2 ${config.iconColor}`} />
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Student Information */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Student Details
            </h4>
            
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={meeting.studentAvatar} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {meeting.studentName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{meeting.studentName}</p>
                <p className="text-sm text-gray-600">{meeting.enrollmentId}</p>
              </div>
              {getPriorityBadge(meeting.priority)}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Reason for Meeting:</Label>
              <p className="text-sm text-gray-600 mt-1 p-2 bg-white rounded border">
                {meeting.reason}
              </p>
            </div>
          </div>

          {/* Current Meeting Time */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {actionType === 'reschedule' ? 'Current Requested Time' : 'Requested Meeting Time'}
            </Label>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                {formatDateTime(meeting.preferredTime)}
              </p>
            </div>
          </div>

          {/* Reschedule New Time */}
          {actionType === 'reschedule' && (
            <div className="space-y-2">
              <Label htmlFor="newDateTime" className="text-sm font-medium text-gray-700 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                New Meeting Time
              </Label>
              <Input
                id="newDateTime"
                type="datetime-local"
                value={newDateTime}
                onChange={(e) => setNewDateTime(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          {/* Notes/Reason */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              {actionType === 'decline' ? 'Reason for Declining (Required)' : 'Additional Notes (Optional)'}
            </Label>
            <Textarea
              id="notes"
              placeholder={
                actionType === 'decline' 
                  ? "Please provide a reason for declining this meeting request..."
                  : actionType === 'reschedule'
                  ? "Explain why reschedule is needed (optional)..."
                  : "Add any notes or special instructions (optional)..."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Warning for urgent requests */}
          {meeting.priority === 'urgent' && actionType === 'decline' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">High Priority Request</p>
                  <p className="text-sm text-red-700">
                    This is marked as urgent. Consider rescheduling instead of declining if possible.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="space-x-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className={config.buttonColor}
            onClick={handleConfirm}
            disabled={isSubmitting || (actionType === 'decline' && !notes.trim())}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              <>
                <Icon className="h-4 w-4 mr-2" />
                {config.buttonText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingActionModal;