"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ArrowRight, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface ActiveSession {
  id: string;
  student_alias?: string;
  last_message_at: string | null;
  risk_level: string;
  faculty?: {
    name: string;
    department: {
      name: string;
      code: string;
    };
  };
}

interface ActiveAnonymousSessionsProps {
  userType: "STUDENT" | "FACULTY";
}

export default function ActiveAnonymousSessions({
  userType,
}: ActiveAnonymousSessionsProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const response = await fetch("/api/anonymous-mentoring/active", {
        credentials: "include",
      });
      const result = await response.json();

      if (result.success) {
        setSessions(result.data.sessions);
      }
    } catch (error) {
      console.error("Failed to fetch active sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "NORMAL":
        return "bg-green-100 text-green-800";
      case "MODERATE":
        return "bg-yellow-100 text-yellow-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "CRISIS":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewAll = () => {
    if (userType === "STUDENT") {
      router.push("/student/anonymous-mentoring");
    } else {
      router.push("/faculty/anonymous-mentoring");
    }
  };

  const handleOpenSession = (sessionId: string) => {
    if (userType === "STUDENT") {
      router.push(`/student/anonymous-mentoring/chat/${sessionId}`);
    } else {
      router.push(`/faculty/anonymous-mentoring/chat/${sessionId}`);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            Active Anonymous Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return null; // Don't show widget if no active sessions
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          Active Anonymous Sessions
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleViewAll}>
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 bg-gradient-to-br from-purple-50/60 to-pink-50/60 rounded-lg border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => handleOpenSession(session.id)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <UserCircle className="w-8 h-8 text-purple-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  {userType === "FACULTY" ? (
                    <p className="font-medium text-gray-900 truncate">
                      {session.student_alias}
                    </p>
                  ) : (
                    <div>
                      <p className="font-medium text-gray-900 truncate">
                        {session.faculty?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.faculty?.department.name}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {session.last_message_at
                      ? formatDistanceToNow(new Date(session.last_message_at), {
                          addSuffix: true,
                        })
                      : "No messages yet"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge className={`${getRiskLevelColor(session.risk_level)} text-xs`}>
                  {session.risk_level}
                </Badge>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
