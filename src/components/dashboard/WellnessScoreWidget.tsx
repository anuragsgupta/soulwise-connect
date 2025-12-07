"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Brain, 
  Heart, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle,
  Info
} from "lucide-react";
import { getWellnessCategory } from "@/lib/wellness-score";

interface WellnessScoreData {
  overallScore: number;
  normalizedScores: {
    mood: number;
    phq9: number;
    gad7: number;
    chatbot: number;
  };
  hasRedFlags: boolean;
  redFlagReasons: string[];
  breakdown: {
    moodContribution: number;
    phq9Contribution: number;
    gad7Contribution: number;
    chatbotContribution: number;
  };
}

interface WellnessScoreWidgetProps {
  studentId: string;
  showBreakdown?: boolean;
  hideOverallScore?: boolean;
  hideCalculationInfo?: boolean;
}

export default function WellnessScoreWidget({ 
  studentId, 
  showBreakdown = true,
  hideOverallScore = false,
  hideCalculationInfo = false
}: WellnessScoreWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wellnessData, setWellnessData] = useState<WellnessScoreData | null>(null);

  useEffect(() => {
    fetchWellnessScore();
  }, [studentId]);

  const fetchWellnessScore = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/wellness-score?studentId=${studentId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch wellness score');
      }

      setWellnessData(data.wellnessScore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Wellness Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Wellness Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!wellnessData) {
    return null;
  }

  const wellnessCategory = getWellnessCategory(wellnessData.overallScore);

  return (
    <div className="space-y-4">
      {/* Main Wellness Score Card */}
      {!hideOverallScore && (
      <Card className={wellnessData.hasRedFlags ? "border-red-500 border-2" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <CardTitle className="font-heading">Overall Wellness Score</CardTitle>
            </div>
            <Badge 
              variant={wellnessData.hasRedFlags ? "destructive" : "default"}
              className={wellnessCategory.color}
            >
              {wellnessCategory.category}
            </Badge>
          </div>
          <CardDescription className="font-body">
            Comprehensive mental health assessment based on multiple factors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">
                  {wellnessData.overallScore}
                </div>
                <div className="text-sm text-muted-foreground">out of 100</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={wellnessData.overallScore} className="h-3" />
            <p className="text-sm text-center text-muted-foreground font-body">
              {wellnessCategory.description}
            </p>
          </div>

          {/* Red Flags Alert */}
          {wellnessData.hasRedFlags && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertTitle className="font-heading">Critical Wellness Concerns Detected</AlertTitle>
              <AlertDescription className="font-body">
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {wellnessData.redFlagReasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
                <p className="mt-3 font-semibold">
                  Immediate professional support is recommended. Please contact your counselor or mental health services.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      )}

      {/* Score Breakdown */}
      {showBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Score Breakdown
            </CardTitle>
            <CardDescription className="font-body">
              How different factors contribute to your overall wellness
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mood Contribution */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-medium font-heading">Daily Mood</span>
                </div>
                <span className="text-sm font-bold">
                  {wellnessData.breakdown.moodContribution.toFixed(1)} / 30
                </span>
              </div>
              <Progress 
                value={(wellnessData.breakdown.moodContribution / 30) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                Weight: 30% • Based on 14-day weighted average
              </p>
            </div>

            {/* PHQ-9 Contribution */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium font-heading">PHQ-9 (Depression)</span>
                </div>
                <span className="text-sm font-bold">
                  {wellnessData.breakdown.phq9Contribution.toFixed(1)} / 25
                </span>
              </div>
              <Progress 
                value={(wellnessData.breakdown.phq9Contribution / 25) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                Weight: 25% • Clinical assessment
              </p>
            </div>

            {/* GAD-7 Contribution */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium font-heading">GAD-7 (Anxiety)</span>
                </div>
                <span className="text-sm font-bold">
                  {wellnessData.breakdown.gad7Contribution.toFixed(1)} / 25
                </span>
              </div>
              <Progress 
                value={(wellnessData.breakdown.gad7Contribution / 25) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                Weight: 25% • Clinical assessment
              </p>
            </div>

            {/* Chatbot Contribution */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium font-heading">AI Conversation Analysis</span>
                </div>
                <span className="text-sm font-bold">
                  {wellnessData.breakdown.chatbotContribution.toFixed(1)} / 20
                </span>
              </div>
              <Progress 
                value={(wellnessData.breakdown.chatbotContribution / 20) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                Weight: 20% • Sentiment analysis from chat sessions
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      {!hideCalculationInfo && (
        <Alert>
          <Info className="w-4 h-4" />
          <AlertTitle className="font-heading">How is this calculated?</AlertTitle>
          <AlertDescription className="font-body">
            Your wellness score is calculated using a Multi-Criteria Decision Analysis (MCDA) algorithm 
            that combines your daily mood check-ins, clinical assessments (PHQ-9, GAD-7), and AI-analyzed 
            conversation patterns. Recent data is weighted more heavily, and clinical assessments 
            (50% weight) are prioritized over subjective daily inputs for accuracy.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
