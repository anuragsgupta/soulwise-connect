"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Brain, 
  Zap,
  Coffee,
  Moon,
  Activity,
  TrendingUp,
  Loader2,
  Calendar,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import MoodCheckInFlow from "./mood-checkin/MoodCheckInFlow";

const moods = [
  { emoji: "😄", label: "Excellent", value: 5, color: "text-green-500", bgColor: "bg-green-50 hover:bg-green-100 border-green-200" },
  { emoji: "😊", label: "Good", value: 4, color: "text-blue-500", bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
  { emoji: "😐", label: "Okay", value: 3, color: "text-yellow-500", bgColor: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200" },
  { emoji: "😟", label: "Low", value: 2, color: "text-orange-500", bgColor: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
  { emoji: "😢", label: "Very Low", value: 1, color: "text-red-500", bgColor: "bg-red-50 hover:bg-red-100 border-red-200" }
];

interface EnhancedFactors {
  emotions?: string[];
  activities?: string[];
  company?: string[];
  timestamp?: string;
}

interface MoodCheckIn {
  id: string;
  moodScore: number;
  moodLabel: string;
  factors?: string[] | EnhancedFactors;
  notes?: string;
  checkInDate: string;
  createdAt: string;
}

interface MoodTrackerProps {
  onScoreUpdate: (score: number) => void;
}

const MoodTracker = ({ onScoreUpdate }: MoodTrackerProps) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [factors, setFactors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [moodHistory, setMoodHistory] = useState<MoodCheckIn[]>([]);
  const [todayCheckIn, setTodayCheckIn] = useState<MoodCheckIn | null>(null);
  const [showEnhancedFlow, setShowEnhancedFlow] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load mood data on component mount
  useEffect(() => {
    loadMoodData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMoodData = async () => {
    if (!user?.id || user.userType !== 'STUDENT') {
      console.warn('Student authentication required for mood tracking');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/mood-checkin?studentId=${user.id}&days=7`);
      const result = await response.json();
      
      if (result.success) {
        setMoodHistory(result.data.moodCheckIns || []);
        setTodayCheckIn(result.data.todayCheckIn);
        
        // If there's a check-in for today, populate the form
        if (result.data.todayCheckIn) {
          setSelectedMood(result.data.todayCheckIn.moodScore);
          setMoodNote(result.data.todayCheckIn.notes || '');
          // Handle both old array format and new object format
          const checkInFactors = result.data.todayCheckIn.factors;
          if (Array.isArray(checkInFactors)) {
            setFactors(checkInFactors);
          } else {
            setFactors([]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load mood data:', error);
      toast({
        title: "Failed to load mood data",
        description: "Using offline mode. Your data will sync when connection is restored.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const moodFactors = [
    { id: 'sleep', label: 'Sleep Quality', icon: Moon },
    { id: 'energy', label: 'Energy Level', icon: Zap },
    { id: 'stress', label: 'Stress Level', icon: Brain },
    { id: 'social', label: 'Social Connection', icon: Heart },
    { id: 'exercise', label: 'Physical Activity', icon: Activity },
    { id: 'work', label: 'Academic Load', icon: Coffee }
  ];

  const toggleFactor = (factorId: string) => {
    setFactors(prev => 
      prev.includes(factorId) 
        ? prev.filter(f => f !== factorId)
        : [...prev, factorId]
    );
  };

  const handleSubmit = async () => {
    if (selectedMood === null) {
      toast({
        title: "Please select your mood",
        description: "Choose how you're feeling today before submitting.",
        variant: "destructive"
      });
      return;
    }

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
      const moodData = moods.find(m => m.value === selectedMood);
      
      const response = await fetch('/api/mood-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user.id,
          moodScore: selectedMood,
          moodLabel: moodData?.label,
          factors: factors.length > 0 ? factors : null,
          notes: moodNote.trim() || null
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Calculate wellness score based on mood and factors
        const baseScore = selectedMood * 20;
        const factorBonus = factors.length * 2;
        const finalScore = Math.min(100, baseScore + factorBonus);
        
        onScoreUpdate(finalScore);
        
        toast({
          title: result.data.isUpdate ? "Mood updated successfully! 🌟" : "Mood logged successfully! 🌟",
          description: `Thank you for checking in. Your wellness score has been updated to ${finalScore}%.`,
        });

        // Reload mood data to show updated history
        await loadMoodData();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Failed to submit mood:', error);
      toast({
        title: "Failed to log mood",
        description: "Please try again. Your data will be saved once connection is restored.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle completion of enhanced flow
  const handleFlowComplete = async () => {
    setShowEnhancedFlow(false);
    await loadMoodData();
    
    toast({
      title: "Mood logged successfully! 🌟",
      description: "Your check-in has been saved. Thank you for tracking your wellness!",
    });
  };

  // Show enhanced flow if requested
  if (showEnhancedFlow) {
    return (
      <MoodCheckInFlow 
        onComplete={handleFlowComplete}
        onScoreUpdate={onScoreUpdate}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Show authentication warning if not a student */}
      {(!user || user.userType !== 'STUDENT') && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <Brain className="w-5 h-5" />
              <span className="font-medium">Student Login Required</span>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              Please log in with your student credentials to access mood tracking features.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-2xl">
            <div className="flex items-center">
              <Heart className="w-6 h-6 mr-3 text-wellness animate-pulse-soft" />
              Daily Mood Check-In
            </div>
            <Button
              onClick={() => setShowEnhancedFlow(true)}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Enhanced Check-In
            </Button>
          </CardTitle>
          <CardDescription>
            Taking a moment to reflect on your mental state helps build self-awareness and track your wellness journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Promote Enhanced Flow for users without today's check-in */}
          {!todayCheckIn && user && user.userType === 'STUDENT' && (
            <div className="bg-gradient-to-br from-teal-50 to-sky-50 border-2 border-teal-200 rounded-xl p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <Sparkles className="w-6 h-6 text-teal-600 mr-2" />
                    <h3 className="text-lg font-bold text-gray-800">
                      Try Our Enhanced Check-In!
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Get deeper insights with our interactive 5-step mood journey. Track emotions, activities, and more!
                  </p>
                  <Button
                    onClick={() => setShowEnhancedFlow(true)}
                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-md"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Enhanced Check-In
                  </Button>
                </div>
                <div className="text-5xl ml-4">🌟</div>
              </div>
            </div>
          )}

          {/* Show today's check-in status if available */}
          {todayCheckIn && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">You&apos;ve already checked in today!</span>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {moods.find(m => m.value === todayCheckIn.moodScore)?.label}
                </Badge>
              </div>
              <p className="text-sm text-green-700 mt-2">You can update your mood if it has changed.</p>
            </div>
          )}

          {/* Mood Selection */}
          <div>
            <Label className="text-base font-medium mb-4 block">How are you feeling right now?</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {moods.map((mood) => (
                <Card
                  key={mood.value}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                    selectedMood === mood.value 
                      ? `${mood.bgColor} ring-2 ring-primary shadow-lg` 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedMood(mood.value)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{mood.emoji}</div>
                    <div className={`font-medium ${mood.color}`}>{mood.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Mood Factors */}
          <div>
            <Label className="text-base font-medium mb-4 block">What&apos;s affecting your mood today? (Optional)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {moodFactors.map((factor) => (
                <Button
                  key={factor.id}
                  variant={factors.includes(factor.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleFactor(factor.id)}
                  className={`justify-start h-auto p-3 ${
                    factors.includes(factor.id) 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-primary/10 hover:text-primary hover:border-primary'
                  }`}
                >
                  <factor.icon className="w-4 h-4 mr-2" />
                  {factor.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Mood Note */}
          <div>
            <Label htmlFor="mood-note" className="text-base font-medium mb-2 block">
              Share your thoughts (Optional)
            </Label>
            <Textarea
              id="mood-note"
              placeholder="What's on your mind today? Any specific thoughts or experiences you'd like to note..."
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-wellness to-primary hover:from-wellness/90 hover:to-primary/90 transition-all duration-300 py-3"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {todayCheckIn ? 'Updating...' : 'Logging...'}
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5 mr-2" />
                {todayCheckIn ? 'Update My Mood' : 'Log My Mood'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Weekly Mood Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Your Mood Trends
          </CardTitle>
          <CardDescription>Here&apos;s how your mood has been trending this week</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading mood history...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - index));
                  const dateStr = date.toISOString().split('T')[0];
                  
                  const dayMood = moodHistory.find(mood => 
                    mood.checkInDate.split('T')[0] === dateStr
                  );
                  
                  const moodData = dayMood ? moods.find(m => m.value === dayMood.moodScore) : null;
                  
                  return (
                    <div key={day} className={`text-center p-3 rounded-lg transition-all ${
                      dayMood ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
                    }`}>
                      <div className="text-xs text-muted-foreground mb-1">{day}</div>
                      <div className="text-xl">
                        {dayMood ? moodData?.emoji : '❓'}
                      </div>
                      <div className={`text-xs font-medium ${
                        dayMood ? moodData?.color : 'text-muted-foreground'
                      }`}>
                        {dayMood ? moodData?.label : 'No data'}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Show today's status */}
              {todayCheckIn && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">Today&apos;s Check-in Complete</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {moods.find(m => m.value === todayCheckIn.moodScore)?.label}
                    </Badge>
                  </div>
                  
                  {/* Display enhanced data if available */}
                  {todayCheckIn.factors && typeof todayCheckIn.factors === 'object' && !Array.isArray(todayCheckIn.factors) && (
                    <div className="mt-3 space-y-2">
                      {(todayCheckIn.factors as EnhancedFactors).emotions && (todayCheckIn.factors as EnhancedFactors).emotions!.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-green-700 font-medium">Emotions:</span>
                          {(todayCheckIn.factors as EnhancedFactors).emotions!.map((emotion: string, idx: number) => (
                            <span key={idx} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                              {emotion}
                            </span>
                          ))}
                        </div>
                      )}
                      {(todayCheckIn.factors as EnhancedFactors).activities && (todayCheckIn.factors as EnhancedFactors).activities!.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-green-700 font-medium">Activities:</span>
                          {(todayCheckIn.factors as EnhancedFactors).activities!.map((activity: string, idx: number) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              {activity}
                            </span>
                          ))}
                        </div>
                      )}
                      {(todayCheckIn.factors as EnhancedFactors).company && (todayCheckIn.factors as EnhancedFactors).company!.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-green-700 font-medium">With:</span>
                          {(todayCheckIn.factors as EnhancedFactors).company!.map((comp: string, idx: number) => (
                            <span key={idx} className="text-xs bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full">
                              {comp}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {todayCheckIn.notes && (
                    <p className="text-sm text-green-700 mt-2 italic">&quot;{todayCheckIn.notes}&quot;</p>
                  )}
                </div>
              )}
              
              {/* Show mood statistics */}
              {moodHistory.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 mb-2">This Week&apos;s Summary</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Average Mood:</span>
                      <span className="font-medium ml-1">
                        {(moodHistory.reduce((sum, mood) => sum + mood.moodScore, 0) / moodHistory.length).toFixed(1)}/5
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Check-ins:</span>
                      <span className="font-medium ml-1">{moodHistory.length}/7 days</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodTracker;