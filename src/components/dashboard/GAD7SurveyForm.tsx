"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Heart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { saveDemoGad7Survey } from "@/lib/demoDB";

interface SurveyResult {
  id: string;
  totalScore: number;
  severity: string;
  completedAt: string;
}

interface GAD7FormProps {
  studentId: string;
  onComplete?: (result: { success: boolean; survey: SurveyResult }) => void;
}

const questions = [
  {
    id: "q1_nervous",
    text: "Feeling anxious, keyed-up, or tense regarding upcoming exams or project deadlines.",
    field: "q1_nervous",
  },
  {
    id: "q2_control",
    text: "Finding it nearly impossible to control or stop worrying once you start thinking about your job or competitive exam prospects.",
    field: "q2_control",
  },
  {
    id: "q3_worrying",
    text: "Spending excessive time worrying about several different academic, social, or financial issues simultaneously.",
    field: "q3_worrying",
  },
  {
    id: "q4_relaxing",
    text: "Struggling to relax your mind or body, even when you have free time (e.g., trouble relaxing even while listening to music or watching a show).",
    field: "q4_relaxing",
  },
  {
    id: "q5_restless",
    text: "Being so restless that you find yourself constantly fidgeting, pacing your room, or feeling you must move.",
    field: "q5_restless",
  },
  {
    id: "q6_irritable",
    text: "Getting easily short-tempered, frustrated, or annoyed by small issues like slow internet or minor administrative delays.",
    field: "q6_irritable",
  },
  {
    id: "q7_afraid",
    text: "Feeling a sudden, strong sense of impending doom or that a disaster (like failing a course or losing a scholarship) is about to strike.",
    field: "q7_afraid",
  },
];

const options = [
  { value: "0", label: "Not at all" },
  { value: "1", label: "Several Days" },
  { value: "2", label: "More than half the time" },
  { value: "3", label: "Nearly every day" },
];

export default function GAD7SurveyForm({ studentId, onComplete }: GAD7FormProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SurveyResult | null>(null);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: parseInt(value),
    }));
    setError(null);
  };

  const isAllAnswered = () => {
    return questions.every((q) => answers[q.field] !== undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAllAnswered()) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (studentId === "demo-student-123") {
        const totalScore = Object.values(answers).reduce((sum, answer) => sum + answer, 0);
        const severity = totalScore <= 4 ? "MINIMAL" : totalScore <= 9 ? "MILD" : totalScore <= 14 ? "MODERATE" : "SEVERE";
        await saveDemoGad7Survey({ studentId, ...answers, totalScore, severity });
        window.dispatchEvent(new Event("demo-data-updated"));
        const demoResult = { id: `gad7-${Date.now()}`, totalScore, severity, completedAt: new Date().toISOString() };
        setResult(demoResult);
        setSubmitted(true);
        onComplete?.({ success: true, survey: demoResult });
        return;
      }

      const response = await fetch("/api/gad7-survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          ...answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit survey");
      }

      setResult(data.survey);
      setSubmitted(true);
      
      if (onComplete) {
        onComplete(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityInfo = (severity: string) => {
    const severityMap: Record<string, { label: string; color: string; description: string }> = {
      MINIMAL: {
        label: "Minimal Anxiety",
        color: "text-green-600",
        description: "Your responses suggest minimal to no anxiety symptoms.",
      },
      MILD: {
        label: "Mild Anxiety",
        color: "text-yellow-600",
        description: "Your responses suggest mild anxiety symptoms. Consider self-care strategies.",
      },
      MODERATE: {
        label: "Moderate Anxiety",
        color: "text-orange-600",
        description: "Your responses suggest moderate anxiety symptoms. We recommend speaking with a counselor.",
      },
      SEVERE: {
        label: "Severe Anxiety",
        color: "text-red-600",
        description: "Your responses suggest severe anxiety symptoms. Please reach out to a mental health professional.",
      },
    };

    return severityMap[severity] || severityMap.MINIMAL;
  };

  if (submitted && result) {
    const severityInfo = getSeverityInfo(result.severity);

    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <CardTitle className="text-2xl font-heading">Assessment Complete</CardTitle>
              <CardDescription className="font-body">
                Thank you for completing the GAD-7 assessment
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Results Summary */}
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 font-heading">Your Results</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">{result.totalScore}</span>
                  <span className="text-xl text-muted-foreground">/21</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Severity Level</p>
                <p className={`text-xl font-semibold ${severityInfo.color}`}>
                  {severityInfo.label}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {severityInfo.description}
                </p>
              </div>
            </div>
          </div>

          {/* Critical Alert for Severe Cases */}
          {result.severity === 'SEVERE' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Immediate Support Available</AlertTitle>
              <AlertDescription>
                Your responses indicate severe anxiety symptoms. We strongly encourage you to:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Contact the campus counseling center immediately</li>
                  <li>Speak with your faculty mentor or a trusted advisor</li>
                  <li>Call our 24/7 crisis helpline if needed</li>
                  <li>Reach out to family or friends for support</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Support Resources */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 font-heading flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Support Resources
            </h3>
            <div className="space-y-2 text-sm">
              <p>• Book a counseling session through your dashboard</p>
              <p>• Explore our mindfulness and relaxation exercises</p>
              <p>• Join student support groups and wellness activities</p>
              <p>• Access our 24/7 AI chatbot for immediate support</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1"
            >
              Return to Dashboard
            </Button>
            <Button
              onClick={() => {
                setSubmitted(false);
                setResult(null);
                setAnswers({});
              }}
              variant="outline"
              className="flex-1"
            >
              Take Another Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
        <CardTitle className="text-2xl font-heading">GAD-7 Anxiety Assessment</CardTitle>
        <CardDescription className="font-body">
          Over the last 2 weeks, how often have you been bothered by the following problems?
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-3">
              <Label className="text-base font-medium font-body">
                <span className="text-primary font-semibold">{index + 1}.</span> {question.text}
              </Label>
              <RadioGroup
                value={answers[question.field]?.toString()}
                onValueChange={(value) => handleAnswerChange(question.field, value)}
                className="space-y-2"
              >
                {options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                    <Label
                      htmlFor={`${question.id}-${option.value}`}
                      className="flex-1 cursor-pointer font-body"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={!isAllAnswered() || submitting}
              className="flex-1"
            >
              {submitting ? "Submitting..." : "Submit Assessment"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            <p>
              Questions Answered: {Object.keys(answers).length} / {questions.length}
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
