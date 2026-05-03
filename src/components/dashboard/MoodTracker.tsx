"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import MoodCheckInFlow from "./mood-checkin/MoodCheckInFlow";
import MoodDashboard from "./mood-checkin/MoodDashboard";
import { getTodayDemoMoodCheckIn } from "@/lib/demoDB";

interface MoodCheckIn {
  id: string;
  moodScore: number;
  moodLabel: string;
  factors: Record<string, number>;
  notes: string | null;
  checkInDate: string;
  createdAt: string;
}

interface MoodTrackerProps {
  onScoreUpdate: (score: number) => void;
}

const MoodTracker = ({ onScoreUpdate }: MoodTrackerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [todayCheckIn, setTodayCheckIn] = useState<MoodCheckIn | null>(null);
  const [showEnhancedFlow, setShowEnhancedFlow] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load mood data on component mount
  useEffect(() => {
    loadMoodData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Automatically show enhanced flow if no check-in today
  useEffect(() => {
    if (!isLoading && !todayCheckIn && user && user.userType === 'STUDENT') {
      setShowEnhancedFlow(true);
    }
  }, [isLoading, todayCheckIn, user]);

  const loadMoodData = async () => {
    if (!user?.id || user.userType !== 'STUDENT') {
      console.warn('Student authentication required for mood tracking');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      if (user.id === 'demo-student-123') {
        const todayCheckIn = await getTodayDemoMoodCheckIn(user.id);
        setTodayCheckIn(todayCheckIn);
      } else {
        const response = await fetch(`/api/mood-checkin/enhanced?studentId=${user.id}&days=7`);
        const result = await response.json();
        
        if (result.success) {
          setTodayCheckIn(result.data.todayCheckIn);
        }
      }
    } catch (error) {
      console.error('Failed to load mood data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckInComplete = () => {
    setShowEnhancedFlow(false);
    loadMoodData();
    toast({
      title: "Mood tracked successfully!",
      description: "Your check-in has been saved."
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">📊</div>
          <div className="text-gray-600">Loading your mood tracker...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showEnhancedFlow ? (
        <MoodCheckInFlow
          onComplete={handleCheckInComplete}
          onScoreUpdate={onScoreUpdate}
          existingCheckIn={todayCheckIn}
        />
      ) : (
        <MoodDashboard
          onStartCheckIn={() => setShowEnhancedFlow(true)}
          todayCheckIn={todayCheckIn}
        />
      )}
    </>
  );
};

export default MoodTracker;
