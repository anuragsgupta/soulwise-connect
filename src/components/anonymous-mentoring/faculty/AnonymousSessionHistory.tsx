'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Clock, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Session {
  id: string;
  student_alias: string;
  status: string;
  risk_level: string;
  created_at: string;
  last_message_at: string | null;
  ended_at: string | null;
  _count: {
    anonymous_mentor_messages: number;
  };
}

export default function AnonymousSessionHistory() {
  const router = useRouter();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/anonymous-mentoring/sessions', {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setSessions(result.data.sessions);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to load sessions'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load sessions'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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
          <p className="mt-4 text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  const activeSessions = sessions.filter(s => s.status === 'ACTIVE');
  const endedSessions = sessions.filter(s => s.status === 'ENDED');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Anonymous Mentoring Sessions</h1>
        <p className="text-purple-100">Manage your anonymous chat sessions with students</p>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active Sessions
            {activeSessions.length > 0 && (
              <Badge className="ml-2 bg-purple-600">{activeSessions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ended">
            Ended Sessions
            {endedSessions.length > 0 && (
              <Badge className="ml-2 bg-gray-600">{endedSessions.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeSessions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No active sessions</p>
                <p className="text-sm text-gray-500 mt-2">
                  Active sessions will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            activeSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <UserCircle className="h-10 w-10 text-purple-600" />
                      <div>
                        <CardTitle className="text-lg">{session.student_alias}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Started {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                        </p>
                      </div>
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
                      onClick={() => router.push(`/faculty/anonymous-mentoring/chat/${session.id}`)}
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
                    <div className="flex items-center gap-3">
                      <UserCircle className="h-10 w-10 text-gray-400" />
                      <div>
                        <CardTitle className="text-lg">{session.student_alias}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Ended {formatDistanceToNow(new Date(session.ended_at || session.created_at), {
                            addSuffix: true
                          })}
                        </p>
                      </div>
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
                          Duration: {formatDistanceToNow(new Date(session.created_at), {
                            addSuffix: false
                          })}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push(`/faculty/anonymous-mentoring/chat/${session.id}`)}
                      variant="outline"
                    >
                      View History
                    </Button>
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
