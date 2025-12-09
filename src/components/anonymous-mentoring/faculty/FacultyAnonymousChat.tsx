"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Send,
  PhoneOff,
  UserCircle,
  AlertTriangle,
  MessageSquare,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  sender_role: "STUDENT" | "MENTOR";
  message_text: string;
  sentiment_label: string | null;
  risk_score: number | null;
  created_at: string;
  is_read: boolean;
}

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

interface Props {
  sessionId: string;
}

export default function FacultyAnonymousChat({ sessionId }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [ending, setEnding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchSession();
    fetchMessages();

    // Start polling for new messages every 3 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSession = async () => {
    try {
      const response = await fetch(
        `/api/anonymous-mentoring/sessions/${sessionId}`,
        {
          credentials: "include",
        }
      );

      const result = await response.json();

      if (result.success) {
        setSession(result.data.session);

        // If session is ended, stop polling
        if (result.data.session.status === "ENDED") {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to load session",
        });
        router.push("/faculty/anonymous-mentoring/sessions");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load session details",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `/api/anonymous-mentoring/sessions/${sessionId}/messages`,
        {
          credentials: "include",
        }
      );

      const result = await response.json();

      if (result.success) {
        setMessages(result.data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    if (session?.status !== "ACTIVE") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Session is not active",
      });
      return;
    }

    setSending(true);

    try {
      const response = await fetch(
        `/api/anonymous-mentoring/sessions/${sessionId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            messageText: newMessage.trim(),
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setNewMessage("");
        fetchMessages();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to send message",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message",
      });
    } finally {
      setSending(false);
    }
  };

  const handleEndSession = async () => {
    setEnding(true);

    try {
      const response = await fetch(
        `/api/anonymous-mentoring/sessions/${sessionId}/end`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            endedBy: "FACULTY",
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Session Ended",
          description:
            "The anonymous session has been closed. Chat history is retained for your records.",
        });
        router.push("/faculty/anonymous-mentoring/sessions");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to end session",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to end session",
      });
    } finally {
      setEnding(false);
      setShowEndDialog(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Session not found</p>
      </div>
    );
  }

  const isActive = session.status === "ACTIVE";
  const isEnded = session.status === "ENDED";

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCircle className="h-10 w-10" />
              <div>
                <CardTitle className="text-xl">
                  Chat with: {session.student_alias}
                </CardTitle>
                <p className="text-purple-100 text-sm">
                  {isActive && "Active anonymous session"}
                  {isEnded && "Session ended"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getRiskLevelColor(session.risk_level)}>
                Risk: {session.risk_level}
              </Badge>
              <Badge
                variant={isActive ? "default" : "secondary"}
                className="bg-white text-purple-700"
              >
                {session.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Session Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-gray-500">Started</p>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(session.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-gray-500">Messages</p>
                <p className="font-medium">
                  {session._count?.anonymous_mentor_messages || messages.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-gray-500">Last Activity</p>
                <p className="font-medium">
                  {session.last_message_at
                    ? formatDistanceToNow(new Date(session.last_message_at), {
                        addSuffix: true,
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      <Card className="flex flex-col h-[500px]">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Chat Messages</CardTitle>
            {isActive && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowEndDialog(true)}
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                End Session
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>
                No messages yet. Waiting for {session.student_alias} to start...
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_role === "MENTOR"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender_role === "MENTOR"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm whitespace-pre-wrap break-words flex-1">
                    {message.message_text}
                  </p>
                  {message.risk_score && message.risk_score > 0.5 && (
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p
                    className={`text-xs ${
                      message.sender_role === "MENTOR"
                        ? "text-indigo-200"
                        : "text-gray-500"
                    }`}
                  >
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                  {message.sentiment_label &&
                    message.sentiment_label !== "neutral" && (
                      <Badge
                        variant="outline"
                        className={`text-xs ml-2 ${
                          message.sender_role === "MENTOR"
                            ? "border-white text-white"
                            : ""
                        }`}
                      >
                        {message.sentiment_label}
                      </Badge>
                    )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
        {isActive && (
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={2}
                maxLength={1000}
                className="resize-none"
              />
              <Button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {newMessage.length}/1000 characters
            </p>
          </div>
        )}
        {isEnded && (
          <div className="border-t p-4 bg-gray-50">
            <p className="text-sm text-gray-600 text-center">
              This session has ended. Chat history is retained for your records.
            </p>
          </div>
        )}
      </Card>

      {/* End Session Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Anonymous Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this session with{" "}
              {session.student_alias}? The chat history will be retained for
              your records, but the student will no longer be able to send
              messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={ending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndSession}
              disabled={ending}
              className="bg-red-600 hover:bg-red-700"
            >
              {ending ? "Ending..." : "End Session"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
