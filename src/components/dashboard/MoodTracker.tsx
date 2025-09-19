"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Smile, 
  Meh, 
  Frown, 
  Heart, 
  Brain, 
  Zap,
  Coffee,
  Moon,
  Sun,
  Activity,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const moods = [
  { emoji: "😄", label: "Excellent", value: 5, color: "text-green-500", bgColor: "bg-green-50 hover:bg-green-100 border-green-200" },
  { emoji: "😊", label: "Good", value: 4, color: "text-blue-500", bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
  { emoji: "😐", label: "Okay", value: 3, color: "text-yellow-500", bgColor: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200" },
  { emoji: "😟", label: "Low", value: 2, color: "text-orange-500", bgColor: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
  { emoji: "😢", label: "Very Low", value: 1, color: "text-red-500", bgColor: "bg-red-50 hover:bg-red-100 border-red-200" }
];

interface MoodTrackerProps {
  onScoreUpdate: (score: number) => void;
}

const MoodTracker = ({ onScoreUpdate }: MoodTrackerProps) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [factors, setFactors] = useState<string[]>([]);
  const { toast } = useToast();

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

  const handleSubmit = () => {
    if (selectedMood === null) {
      toast({
        title: "Please select your mood",
        description: "Choose how you're feeling today before submitting.",
        variant: "destructive"
      });
      return;
    }

    // Calculate wellness score based on mood and factors
    const baseScore = selectedMood * 20;
    const factorBonus = factors.length * 2;
    const finalScore = Math.min(100, baseScore + factorBonus);
    
    onScoreUpdate(finalScore);
    
    toast({
      title: "Mood logged successfully! 🌟",
      description: `Thank you for checking in. Your wellness score has been updated to ${finalScore}%.`,
    });

    // Reset form
    setSelectedMood(null);
    setMoodNote("");
    setFactors([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Heart className="w-6 h-6 mr-3 text-wellness animate-pulse-soft" />
            Daily Mood Check-In
          </CardTitle>
          <CardDescription>
            Taking a moment to reflect on your mental state helps build self-awareness and track your wellness journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <Label className="text-base font-medium mb-4 block">What's affecting your mood today? (Optional)</Label>
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
            className="w-full bg-gradient-to-r from-wellness to-primary hover:from-wellness/90 hover:to-primary/90 transition-all duration-300 py-3"
            size="lg"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Log My Mood
          </Button>
        </CardContent>
      </Card>

      {/* Weekly Mood Trends (Mock Data) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Your Mood Trends
          </CardTitle>
          <CardDescription>Here's how your mood has been trending this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
              const mockMood = Math.floor(Math.random() * 5) + 1;
              const moodData = moods.find(m => m.value === mockMood);
              return (
                <div key={day} className="text-center p-3 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">{day}</div>
                  <div className="text-xl">{moodData?.emoji}</div>
                  <div className={`text-xs font-medium ${moodData?.color}`}>
                    {moodData?.label}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodTracker;