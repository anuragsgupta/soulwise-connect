"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users } from "lucide-react";
import FacultySelector from "./FacultySelector";
import MyAnonymousSessions from "./MyAnonymousSessions";

export default function StudentAnonymousMentoringHub() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">
          Anonymous Mentoring
        </h1>
        <p className="text-purple-100">
          Connect with mentors anonymously and continue your sessions
        </p>
      </div>

      <Tabs defaultValue="active-sessions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active-sessions">
            My Sessions
          </TabsTrigger>
          <TabsTrigger value="new-request">
            Start New Session
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active-sessions" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                My Anonymous Mentoring Sessions
              </CardTitle>
              <CardDescription>
                View and continue your active anonymous mentoring conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MyAnonymousSessions />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-request" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Request Anonymous Mentoring
              </CardTitle>
              <CardDescription>
                Select a mentor and start a new anonymous conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FacultySelector />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="border-gray-200 bg-gradient-to-br from-gray-50/50 to-blue-50/30">
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
                <li>• <strong>My Sessions:</strong> View and continue your active anonymous conversations</li>
                <li>• <strong>Start New:</strong> Request a new session with available mentors</li>
                <li>• <strong>Privacy:</strong> Your identity remains anonymous throughout the conversation</li>
                <li>• <strong>Support:</strong> Get help with academic, personal, or mental health concerns</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
