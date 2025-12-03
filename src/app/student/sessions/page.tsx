"use client";

import BookSession from "@/components/sessions/BookSession";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StudentSessionsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.userType !== 'STUDENT') {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || user.userType !== 'STUDENT') {
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
          <h1 className="text-3xl font-bold text-gray-900">Book a Session</h1>
          <p className="text-gray-600 mt-2">
            Schedule meetings with faculty, mentors, or HODs from your institute
          </p>
        </div>
        <BookSession />
      </div>
    </div>
  );
}
