"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Video } from "lucide-react";

interface Session {
  id: string;
  title: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  meetingLink?: string;
  faculty: {
    name: string;
    department?: {
      name: string;
    };
  };
}

interface UpcomingSessionsTableProps {
  studentId: string;
}

export default function UpcomingSessionsTable({ studentId }: UpcomingSessionsTableProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentId) {
      fetchUpcomingSessions();
    }
  }, [studentId]);

  const fetchUpcomingSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/sessions?status=APPROVED`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      
      // Filter for upcoming sessions only (future dates and not completed)
      const allSessions = data.sessions || [];
      const now = new Date();
      const upcomingSessions = allSessions.filter((session: Session) => {
        const sessionDate = new Date(session.scheduledDate);
        return sessionDate >= now && session.status !== 'COMPLETED' && session.status !== 'CANCELLED';
      });
      
      setSessions(upcomingSessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No upcoming sessions scheduled</p>
        <p className="text-gray-400 text-xs mt-1">Book a session to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Faculty</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex flex-col">
                  <div className="flex items-center text-sm font-medium">
                    <Calendar className="w-4 h-4 mr-1.5 text-blue-600" />
                    {formatDate(session.scheduledDate)}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3 mr-1.5" />
                    {formatTime(session.scheduledTime)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <div className="flex items-center text-sm font-medium">
                    <User className="w-4 h-4 mr-1.5 text-gray-600" />
                    {session.faculty.name}
                  </div>
                  {session.faculty.department && (
                    <div className="text-xs text-gray-500 mt-1">
                      {session.faculty.department.name}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{session.title}</span>
              </TableCell>
              <TableCell>
                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                  {session.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {session.meetingLink ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(session.meetingLink, '_blank')}
                    className="text-xs"
                  >
                    <Video className="w-3 h-3 mr-1" />
                    Join
                  </Button>
                ) : (
                  <span className="text-xs text-gray-400">No link</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
