"use client";

import { useState, useEffect } from "react";
import MoodSliderScreen from "./MoodSliderScreen";
import EmotionTagScreen from "./EmotionTagScreen";
import ActivityTagScreen from "./ActivityTagScreen";
import CompanyTagScreen from "./CompanyTagScreen";
import JournalScreen from "./JournalScreen";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface MoodCheckInData {
  moodLevel: number;
  emotions: string[];
  activities: string[];
  company: string[];
  journal: string;
}

interface MoodCheckInFlowProps {
  onComplete: () => void;
  onScoreUpdate?: (score: number) => void;
}

export default function MoodCheckInFlow({ onComplete, onScoreUpdate }: MoodCheckInFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [checkInData, setCheckInData] = useState<MoodCheckInData>({
    moodLevel: 4,
    emotions: [],
    activities: [],
    company: [],
    journal: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Prevent body scrolling when flow is active
  useEffect(() => {
    // Save original overflow
    const originalOverflow = document.body.style.overflow;
    // Disable scrolling
    document.body.style.overflow = 'hidden';
    
    // Restore on cleanup
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleMoodNext = (moodLevel: number) => {
    setCheckInData(prev => ({ ...prev, moodLevel }));
    setCurrentStep(2);
  };

  const handleEmotionsNext = (emotions: string[]) => {
    setCheckInData(prev => ({ ...prev, emotions }));
    setCurrentStep(3);
  };

  const handleActivitiesNext = (activities: string[]) => {
    setCheckInData(prev => ({ ...prev, activities }));
    setCurrentStep(4);
  };

  const handleCompanyNext = (company: string[]) => {
    setCheckInData(prev => ({ ...prev, company }));
    setCurrentStep(5);
  };

  const handleJournalDone = async (journal: string) => {
    setCheckInData(prev => ({ ...prev, journal }));
    
    // Submit to backend
    await submitCheckIn({ ...checkInData, journal });
  };

  const submitCheckIn = async (data: MoodCheckInData) => {
    if (!user?.id || user.userType !== 'STUDENT') {
      toast({
        title: "Authentication required",
        description: "Please log in as a student to track your mood.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/mood-checkin/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user.id,
          moodLevel: data.moodLevel,
          emotions: data.emotions,
          activities: data.activities,
          company: data.company,
          journal: data.journal
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Show completion animation
        setShowCompletion(true);
        
        // Calculate wellness score
        const baseScore = data.moodLevel * 14; // 7 levels, max 98
        const emotionBonus = Math.min(data.emotions.length * 0.5, 2);
        const finalScore = Math.min(100, baseScore + emotionBonus);
        
        if (onScoreUpdate) {
          onScoreUpdate(finalScore);
        }
        
        // Hide completion modal after 2.5 seconds
        setTimeout(() => {
          setShowCompletion(false);
          onComplete();
        }, 2500);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Failed to submit mood check-in:', error);
      toast({
        title: "Failed to save check-in",
        description: "Please try again. Your data will be saved once connection is restored.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  // Completion modal
  if (showCompletion) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-scale-in">
          <div className="text-7xl mb-4 animate-bounce">😊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            We&apos;ve captured your mood Today!
          </h2>
          <div className="flex justify-center gap-1 mt-4">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isSubmitting) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gradient-to-br from-sky-100 via-sky-50 to-blue-100">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">💭</div>
          <div className="text-xl font-semibold text-gray-700">Saving your mood...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentStep === 1 && (
        <MoodSliderScreen
          onNext={handleMoodNext}
          initialMood={checkInData.moodLevel}
        />
      )}
      
      {currentStep === 2 && (
        <EmotionTagScreen
          onNext={handleEmotionsNext}
          onBack={() => setCurrentStep(1)}
          initialEmotions={checkInData.emotions}
        />
      )}
      
      {currentStep === 3 && (
        <ActivityTagScreen
          onNext={handleActivitiesNext}
          onBack={() => setCurrentStep(2)}
          initialActivities={checkInData.activities}
        />
      )}
      
      {currentStep === 4 && (
        <CompanyTagScreen
          onNext={handleCompanyNext}
          onBack={() => setCurrentStep(3)}
          initialCompany={checkInData.company}
        />
      )}
      
      {currentStep === 5 && (
        <JournalScreen
          onDone={handleJournalDone}
          onBack={() => setCurrentStep(4)}
          initialJournal={checkInData.journal}
        />
      )}
    </>
  );
}
