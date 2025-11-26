"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PHQ9SurveyForm from "@/components/dashboard/PHQ9SurveyForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define interfaces for type safety
interface Survey {
  id: string;
  surveyNumber: number;
  totalScore: number;
  severity: string;
  completedAt: string;
}

interface SurveyData {
  success: boolean;
  surveys: Survey[];
  completedSurveys: number;
  remainingSurveys: number;
}

function PHQ9SurveyContent() {
  const searchParams = useSearchParams();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [surveyNumber, setSurveyNumber] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(true);
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Get student ID from search params or session
    const studentIdParam = searchParams.get("studentId");
    
    if (studentIdParam) {
      setStudentId(studentIdParam);
      fetchSurveyStatus(studentIdParam);
    } else {
      // TODO: Get from auth session
      setLoading(false);
    }
  }, [searchParams]);

  const fetchSurveyStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/phq9-survey?studentId=${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setSurveyData(data);
        // Set next survey number
        if (data.completedSurveys < 3) {
          setSurveyNumber((data.completedSurveys + 1) as 1 | 2 | 3);
        }
      }
    } catch (error) {
      console.error("Error fetching survey status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSurveyComplete = () => {
    // Refresh survey data
    if (studentId) {
      fetchSurveyStatus(studentId);
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
          surveyNumber={surveyNumber}
          onComplete={handleSurveyComplete}
        />
      </div>
    );
  }

  const completedSurveys = surveyData?.completedSurveys || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky/10 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
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
          {/* Progress Section */}
          <div className="bg-muted/50 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold font-heading mb-4">Your Progress</h3>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3].map((num) => {
                const completed = completedSurveys >= num;
                const isCurrent = num === surveyNumber && !completed;

                return (
                  <div
                    key={num}
                    className={`
                      flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border-2 transition-all
                      ${completed
                        ? "bg-green-50 border-green-500 dark:bg-green-950"
                        : isCurrent
                        ? "bg-primary/5 border-primary"
                        : "bg-muted border-muted-foreground/20"
                      }
                    `}
                  >
                    {completed ? (
                      <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                    ) : (
                      <div
                        className={`
                        w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center
                        ${isCurrent ? "border-primary text-primary" : "border-muted-foreground/30"}
                      `}
                      >
                        {num}
                      </div>
                    )}
                    <span className="text-xs sm:text-sm font-medium font-body">
                      Survey {num}
                    </span>
                    {completed && (
                      <span className="text-xs text-green-600 font-body">Completed</span>
                    )}
                    {isCurrent && (
                      <span className="text-xs text-primary font-body">Ready</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

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
                <li>Complete all 3 surveys for comprehensive tracking</li>
                <li>Results help us provide appropriate support</li>
              </ul>
            </AlertDescription>
          </Alert>

          {completedSurveys >= 3 ? (
            <Alert>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertTitle className="font-heading text-green-600">All Surveys Completed</AlertTitle>
              <AlertDescription className="font-body">
                You have completed all 3 PHQ-9 surveys. Thank you for your participation!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                onClick={() => setShowForm(true)}
                className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 font-accent"
                size="lg"
              >
                Start Survey #{surveyNumber}
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
          )}

          {/* Previous Surveys */}
          {completedSurveys > 0 && surveyData?.surveys && (
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold font-heading mb-4">Completed Surveys</h3>
              <div className="space-y-3">
                {surveyData.surveys.map((survey: Survey) => {
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
                          Survey #{survey.surveyNumber}
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
      }
    >
      <PHQ9SurveyContent />
    </Suspense>
  );
}
