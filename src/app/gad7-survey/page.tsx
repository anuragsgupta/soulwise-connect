"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import GAD7SurveyForm from "@/components/dashboard/GAD7SurveyForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, CheckCircle2, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { getDemoGad7Surveys, initializeDemoData } from "@/lib/demoDB";

// Define interfaces for type safety
interface Survey {
  id: string;
  totalScore: number;
  severity: string;
  completedAt: string;
}

interface SurveyData {
  success: boolean;
  surveys: Survey[];
  completedSurveys: number;
  latestSurvey: Survey | null;
}

function GAD7SurveyContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [lastCompletedSurvey, setLastCompletedSurvey] = useState<Survey | null>(null);

  useEffect(() => {
    // Get student ID from search params or session
    const studentIdParam = searchParams.get("studentId");
    const id = studentIdParam || user?.id;
    
    if (id) {
      setStudentId(id);
      fetchSurveyStatus(id);
    } else {
      setLoading(false);
    }
  }, [searchParams, user]);

  const fetchSurveyStatus = async (id: string) => {
    try {
      if (id === "demo-student-123") {
        await initializeDemoData(id);
        const surveys = await getDemoGad7Surveys(id);
        const sortedSurveys = surveys.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
        setSurveyData({ success: true, surveys: sortedSurveys, completedSurveys: sortedSurveys.length, latestSurvey: sortedSurveys[0] || null });
        return;
      }

      const response = await fetch(`/api/gad7-survey?studentId=${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setSurveyData(data);
      }
    } catch (error) {
      console.error("Error fetching survey status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSurveyComplete = async (result: { survey: Survey }) => {
    setLastCompletedSurvey(result.survey);
    // Refresh survey data
    if (studentId) {
      await fetchSurveyStatus(studentId);
    }
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green/10 to-blue/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Clock className="w-12 h-12 text-primary animate-pulse" />
              <p className="text-center text-muted-foreground font-body">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!studentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green/10 to-blue/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-heading">Access Required</CardTitle>
            <CardDescription className="font-body">
              Please log in to access the GAD-7 survey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = "/login")}
              className="w-full font-accent"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green/10 to-blue/10 flex items-center justify-center p-4">
        <GAD7SurveyForm
          studentId={studentId}
          onComplete={handleSurveyComplete}
        />
      </div>
    );
  }

  const completedSurveys = surveyData?.completedSurveys || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green/10 to-blue/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="bg-gradient-to-r from-green/10 to-blue/10">
          <div className="flex items-center gap-3">
            <Brain className="w-10 h-10 text-primary" />
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-heading">
                GAD-7 Anxiety Assessment
              </CardTitle>
              <CardDescription className="text-sm sm:text-base font-body mt-1">
                Generalized Anxiety Disorder 7-item Scale
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Information Section */}
          <Alert>
            <Brain className="w-4 h-4" />
            <AlertTitle className="font-heading">About This Assessment</AlertTitle>
            <AlertDescription className="font-body">
              <p className="mb-3">
                The GAD-7 is a validated screening tool designed to assess symptoms of generalized 
                anxiety disorder over the past two weeks. This survey helps identify anxiety levels 
                and guide appropriate support.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Takes approximately 3-5 minutes to complete</li>
                <li>Contains 7 questions about anxiety symptoms</li>
                <li>Your responses are confidential and secure</li>
                <li>Results help us provide appropriate support</li>
                <li>You can retake the assessment anytime</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Score Interpretation Guide */}
          <div className="bg-muted/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 font-heading">Score Interpretation</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-16 text-sm font-semibold text-green-600">0-4</div>
                <div className="flex-1">
                  <p className="font-medium text-green-600">Minimal Anxiety</p>
                  <p className="text-sm text-muted-foreground">Little to no anxiety symptoms</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-16 text-sm font-semibold text-yellow-600">5-9</div>
                <div className="flex-1">
                  <p className="font-medium text-yellow-600">Mild Anxiety</p>
                  <p className="text-sm text-muted-foreground">Mild anxiety symptoms present</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-16 text-sm font-semibold text-orange-600">10-14</div>
                <div className="flex-1">
                  <p className="font-medium text-orange-600">Moderate Anxiety</p>
                  <p className="text-sm text-muted-foreground">Moderate anxiety requiring attention</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-16 text-sm font-semibold text-red-600">15-21</div>
                <div className="flex-1">
                  <p className="font-medium text-red-600">Severe Anxiety</p>
                  <p className="text-sm text-muted-foreground">Severe anxiety needing professional support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {lastCompletedSurvey && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>GAD-7 assessment saved</AlertTitle>
              <AlertDescription>
                Your latest score is {lastCompletedSurvey.totalScore}/21 ({lastCompletedSurvey.severity.toLowerCase().replace('_', ' ')}).
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => setShowForm(true)}
              className="flex-1"
              size="lg"
            >
              {completedSurveys > 0 ? "Take New Assessment" : "Start Assessment"}
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/dashboard")}
              className="flex-1"
              size="lg"
            >
              Back to Dashboard
            </Button>
          </div>

          {completedSurveys > 0 && surveyData?.surveys && (
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold font-heading mb-4">Past GAD-7 Reports</h3>
              <div className="space-y-3">
                {surveyData.surveys.map((survey) => (
                  <div
                    key={survey.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">Score: {survey.totalScore}/21</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(survey.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      {survey.severity.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Notice */}
          <p className="text-xs text-muted-foreground text-center">
            Your responses are confidential and will only be used to provide you with appropriate 
            mental health support. This assessment is not a diagnostic tool and should not replace 
            professional medical advice.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GAD7SurveyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green/10 to-blue/10 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <Clock className="w-12 h-12 text-primary animate-pulse" />
                <p className="text-center text-muted-foreground font-body">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <GAD7SurveyContent />
    </Suspense>
  );
}
