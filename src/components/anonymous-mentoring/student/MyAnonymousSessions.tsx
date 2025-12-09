'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Clock, UserCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Request {
  id: string;
  anonymous_name: string;
  message: string;
  topic: string | null;
  status: string;
  created_at: string;
  responded_at: string | null;
  response_message: string | null;
  faculty: {
    id: string;
    name: string;
    facultyType: string;
    jobTitle: string | null;
    department: {
      name: string;
    };
  };
}

interface Session {
  id: string;
  student_alias: string;
  status: string;
  risk_level: string;
  created_at: string;
  last_message_at: string | null;
  ended_at: string | null;
  faculty: {
    id: string;
    name: string;
    facultyType: string;
    jobTitle: string | null;
    department: {
      name: string;
    };
  };
  _count: {
    anonymous_mentor_messages: number;
  };
}

export default function MyAnonymousSessions() {
  const router = useRouter();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, sessionsRes] = await Promise.all([
        fetch('/api/anonymous-mentoring/requests', { credentials: 'include' }),
        fetch('/api/anonymous-mentoring/sessions', { credentials: 'include' })
      ]);

      const requestsResult = await requestsRes.json();
      const sessionsResult = await sessionsRes.json();

      if (requestsResult.success) {
        setRequests(requestsResult.data.requests);
      }

      if (sessionsResult.success) {
        setSessions(sessionsResult.data.sessions);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load your sessions'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'DECLINED':
        return 'bg-red-100 text-red-800';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'ENDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'NORMAL':
        return 'bg-green-100 text-green-800';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'CRISIS':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const activeSessions = sessions.filter(s => s.status === 'ACTIVE');
  const endedSessions = sessions.filter(s => s.status === 'ENDED');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">My Anonymous Sessions</h1>
        <p className="text-purple-100">View your anonymous chat requests and active sessions</p>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active Sessions
            {activeSessions.length > 0 && (
              <Badge className="ml-2 bg-purple-600">{activeSessions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Requests
            {pendingRequests.length > 0 && (
              <Badge className="ml-2 bg-yellow-600">{pendingRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ended">Ended Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeSessions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No active sessions</p>
                <Button
                  onClick={() => router.push('/student/anonymous-mentoring')}
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                >
                  Start New Chat
                </Button>
              </CardContent>
            </Card>
          ) : (
            activeSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCircle className="h-5 w-5 text-purple-600" />
                        <CardTitle className="text-lg">{session.student_alias}</CardTitle>
                      </div>
                      <p className="text-sm text-gray-600">
                        With {session.faculty.name} - {session.faculty.department.name}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      <Badge className={getRiskLevelColor(session.risk_level)}>
                        {session.risk_level}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{session._count.anonymous_mentor_messages} messages</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          Last message{' '}
                          {session.last_message_at
                            ? formatDistanceToNow(new Date(session.last_message_at), {
                                addSuffix: true
                              })
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push(`/student/anonymous-mentoring/chat/${session.id}`)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Open Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{request.anonymous_name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Requested to {request.faculty.name}
                      </p>
                      {request.topic && (
                        <Badge variant="outline" className="mt-2">
                          {request.topic}
                        </Badge>
                      )}
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Your message:</p>
                      <p className="text-sm text-gray-600 mt-1">{request.message}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>
                        Sent {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-800">
                        Waiting for faculty to accept your request. You'll be notified once they respond.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="ended" className="space-y-4">
          {endedSessions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No ended sessions</p>
              </CardContent>
            </Card>
          ) : (
            endedSessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCircle className="h-5 w-5 text-gray-400" />
                        <CardTitle className="text-lg">{session.student_alias}</CardTitle>
                      </div>
                      <p className="text-sm text-gray-600">
                        With {session.faculty.name} - {session.faculty.department.name}
                      </p>
                    </div>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Ended {formatDistanceToNow(new Date(session.ended_at || session.created_at), {
                          addSuffix: true
                        })}
                      </span>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-700">
                        Chat history has been cleared from your view.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
