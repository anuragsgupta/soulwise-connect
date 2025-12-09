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
import { Send, PhoneOff, UserCircle, AlertTriangle } from "lucide-react";
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

interface Props {
  sessionId: string;
}

export default function AnonymousChatInterface({ sessionId }: Props) {
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
        router.push("/student/anonymous-mentoring");
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

        // Show warning if high risk detected
        if (
          result.data.riskLevel === "HIGH" ||
          result.data.riskLevel === "CRISIS"
        ) {
          toast({
            title: "Message Sent",
            description:
              "Your mentor has been alerted about your message and will respond soon.",
            variant: "default",
          });
        }
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
            endedBy: "STUDENT",
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Session Ended",
          description:
            "Your chat history has been cleared. Thank you for using anonymous mentoring.",
        });
        router.push("/student/anonymous-mentoring");
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
                  You are: {session.student_alias}
                </CardTitle>
                <p className="text-purple-100 text-sm">
                  {isActive && `Connected with ${session.faculty.name}`}
                  {!isActive && "Session has ended"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getRiskLevelColor(session.risk_level)}>
                {session.risk_level}
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

      {/* Messages */}
      <Card className="flex flex-col h-[500px]">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Anonymous Chat</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {session.faculty.jobTitle || session.faculty.facultyType} -{" "}
                {session.faculty.department.name}
              </p>
            </div>
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
          {isEnded && messages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>Session ended. Chat history has been cleared.</p>
            </div>
          )}

          {messages.length === 0 && !isEnded && (
            <div className="text-center py-12 text-gray-500">
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_role === "STUDENT"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender_role === "STUDENT"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.message_text}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender_role === "STUDENT"
                      ? "text-purple-200"
                      : "text-gray-500"
                  }`}
                >
                  {formatDistanceToNow(new Date(message.created_at), {
                    addSuffix: true,
                  })}
                </p>
                {message.risk_score && message.risk_score > 0.5 && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="text-xs">High concern detected</span>
                  </div>
                )}
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
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {newMessage.length}/1000 characters
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
              Are you sure you want to end this session? Your chat history will
              be cleared from your view, but the mentor will retain the
              conversation for record-keeping purposes.
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
