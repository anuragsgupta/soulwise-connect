"use client";

import ManageSessions from "@/components/sessions/ManageSessions";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function FacultySessionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;
    
    if (!user || user.userType !== 'FACULTY') {
      hasRedirected.current = true;
      router.replace('/login');
    }
  }, [user, router]);

  if (!user || user.userType !== 'FACULTY') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Session Management</h1>
          <p className="text-gray-600 mt-2">
            Review and manage student session requests
          </p>
        </div>
        <ManageSessions />
      </div>
    </div>
  );
}
