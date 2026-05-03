"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PHQ9SurveyForm from "@/components/dashboard/PHQ9SurveyForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, CheckCircle2, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

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

function PHQ9SurveyContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [showForm, setShowForm] = useState(false);

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
      const response = await fetch(`/api/phq9-survey?studentId=${id}`);
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

  const handleSurveyComplete = async () => {
    // Refresh survey data
    if (studentId) {
      await fetchSurveyStatus(studentId);
    }
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky/10 to-primary/10 flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-gradient-to-br from-sky/10 to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-heading">Access Required</CardTitle>
            <CardDescription className="font-body">
              Please log in to access the PHQ-9 survey.
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
      <div className="min-h-screen bg-gradient-to-br from-sky/10 to-primary/10 flex items-center justify-center p-4">
        <PHQ9SurveyForm
          studentId={studentId}
          onComplete={handleSurveyComplete}
        />
      </div>
    );
  }

  const completedSurveys = surveyData?.completedSurveys || 0;
  const latestSurvey = surveyData?.latestSurvey;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky/10 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="bg-glacier/20">
          <div className="flex items-center gap-3">
            <Brain className="w-10 h-10 text-primary" />
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-heading">
                PHQ-9 Mental Health Assessment
              </CardTitle>
              <CardDescription className="text-sm sm:text-base font-body mt-1">
                Patient Health Questionnaire - Depression Screening
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
                The PHQ-9 is a validated screening tool designed to assess symptoms of depression over
                the past two weeks. This survey is specifically adapted for student well-being.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Takes approximately 5-7 minutes to complete</li>
                <li>Contains 9 questions about your recent experiences</li>
                <li>Your responses are confidential and secure</li>
                <li>Results help us provide appropriate support</li>
                <li>You can retake the assessment anytime</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={() => setShowForm(true)}
              className="flex-1 bg-medicalBlue hover:bg-medicalBlue-dark font-accent"
              size="lg"
            >
              {completedSurveys > 0 ? 'Take New Assessment' : 'Start Assessment'}
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/dashboard")}
              className="flex-1 font-accent"
              size="lg"
            >
              Back to Dashboard
            </Button>
          </div>

          {/* Previous Surveys */}
          {completedSurveys > 0 && surveyData?.surveys && (
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold font-heading mb-4">Completed Assessments</h3>
              <div className="space-y-3">
                {surveyData.surveys.map((survey: Survey, index: number) => {
                  const severityColorMap: Record<string, string> = {
                    NONE: "text-green-600",
                    MILD: "text-yellow-600",
                    MODERATE: "text-orange-600",
                    MODERATELY_SEVERE: "text-red-600",
                    SEVERE: "text-red-700",
                  };
                  const severityColor = severityColorMap[survey.severity] || "text-gray-600";

                  return (
                    <div
                      key={survey.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-lg gap-2"
                    >
                      <div>
                        <p className="font-medium font-heading">
                          Assessment #{completedSurveys - index}
                        </p>
                        <p className="text-sm text-muted-foreground font-body">
                          Completed: {new Date(survey.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${severityColor}`}>
                          {survey.totalScore}/27
                        </p>
                        <p className={`text-sm ${severityColor}`}>
                          {survey.severity.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle className="font-heading">Crisis Support</AlertTitle>
              <AlertDescription className="font-body">
                <p className="mb-2">
                  If you&apos;re experiencing a mental health crisis or having thoughts of self-harm:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>
                    <strong>KIRAN Mental Health Helpline:</strong> 1800-599-0019 (24/7)
                  </li>
                  <li>
                    <strong>Vandrevala Foundation:</strong> 1860-2662-345
                  </li>
                  <li>Contact your campus counseling center immediately</li>
                  <li>Visit the nearest hospital emergency department</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PHQ9SurveyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-iceBlue flex items-center justify-center p-4">
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
      <PHQ9SurveyContent />
    </Suspense>
  );
}
