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
}

export default function WellnessScoreWidget({ 
  studentId, 
  showBreakdown = true,
  hideOverallScore = false
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
        <Card className="rounded-2xl shadow-md border-gray-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Wellness Score Breakdown
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                Score: {wellnessData.overallScore}/100
              </Badge>
            </div>
            <CardDescription className="text-sm text-gray-600">
              Understanding your mental wellness components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mood Contribution */}
            <div className="space-y-2 p-3 rounded-xl bg-pink-50 border border-pink-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Daily Mood</span>
                </div>
                <span className="text-sm font-bold text-pink-700">
                  {wellnessData.breakdown.moodContribution.toFixed(0)}/30
                </span>
              </div>
              <Progress 
                value={(wellnessData.breakdown.moodContribution / 30) * 100} 
                className="h-2 bg-pink-200"
              />
            </div>

            {/* PHQ-9 Contribution */}
            <div className="space-y-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Depression Screen</span>
                </div>
                <span className="text-sm font-bold text-blue-700">
                  {wellnessData.breakdown.phq9Contribution.toFixed(0)}/25
                </span>
              </div>
              <Progress 
                value={(wellnessData.breakdown.phq9Contribution / 25) * 100} 
                className="h-2 bg-blue-200"
              />
            </div>

            {/* GAD-7 Contribution */}
            <div className="space-y-2 p-3 rounded-xl bg-purple-50 border border-purple-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Anxiety Screen</span>
                </div>
                <span className="text-sm font-bold text-purple-700">
                  {wellnessData.breakdown.gad7Contribution.toFixed(0)}/25
                </span>
              </div>
              <Progress 
                value={(wellnessData.breakdown.gad7Contribution / 25) * 100} 
                className="h-2 bg-purple-200"
              />
            </div>

            {/* Chatbot Contribution */}
            <div className="space-y-2 p-3 rounded-xl bg-green-50 border border-green-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">AI Chat Analysis</span>
                </div>
                <span className="text-sm font-bold text-green-700">
                  {wellnessData.breakdown.chatbotContribution.toFixed(0)}/20
                </span>
              </div>
              <Progress 
                value={(wellnessData.breakdown.chatbotContribution / 20) * 100} 
                className="h-2 bg-green-200"
              />
            </div>

            {/* Info Note */}
            <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-600 flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
                <span>
                  Your wellness score combines multiple factors to provide a comprehensive view of your mental health. Regular check-ins help track your progress over time.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
