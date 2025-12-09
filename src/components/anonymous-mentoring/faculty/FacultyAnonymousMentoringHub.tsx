"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Inbox } from "lucide-react";
import AnonymousRequests from "./AnonymousRequests";
import AnonymousSessionHistory from "./AnonymousSessionHistory";

export default function FacultyAnonymousMentoringHub() {
  const [activeTab, setActiveTab] = useState("active-sessions");

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Anonymous Mentoring
            </h1>
            <p className="text-gray-600 mt-1">
              Manage anonymous student conversations with privacy and care
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="active-sessions" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Active Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="new-requests" className="flex items-center gap-2">
            <Inbox className="w-4 h-4" />
            <span>New Requests</span>
          </TabsTrigger>
        </TabsList>

        {/* Active Sessions Tab */}
        <TabsContent value="active-sessions" className="space-y-4">
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Active & Ongoing Sessions
                </CardTitle>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  Continue Conversations
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Sessions where you are actively helping students. Click to continue the conversation.
              </p>
              <AnonymousSessionHistory showOnlyActive={true} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Requests Tab */}
        <TabsContent value="new-requests" className="space-y-4">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-blue-600" />
                  Pending Requests
                </CardTitle>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Awaiting Response
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                New anonymous mentoring requests from students. Accept to start a session or decline with a kind message.
              </p>
              <AnonymousRequests />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="mt-6 border-gray-200 bg-gradient-to-br from-gray-50/50 to-blue-50/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                How Anonymous Mentoring Works
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Active Sessions:</strong> Continue conversations with students you&apos;re already helping</li>
                <li>• <strong>New Requests:</strong> Review and respond to new mentoring requests</li>
                <li>• <strong>Privacy:</strong> Student identities remain anonymous throughout the conversation</li>
                <li>• <strong>Risk Alerts:</strong> High-risk situations are flagged for immediate attention</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
