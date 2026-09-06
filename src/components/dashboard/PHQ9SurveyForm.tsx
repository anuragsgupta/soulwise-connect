"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Heart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { saveDemoPhq9Survey } from "@/lib/demoDB";

interface SurveyResult {
  id: string;
  totalScore: number;
  severity: string;
  completedAt: string;
}

interface PHQ9FormProps {
  studentId: string;
  onComplete?: (result: { success: boolean; survey: SurveyResult }) => void;
}

const questions = [
  {
    id: "q1_interest",
    text: "Little or no interest in your usual hobbies, hanging out with friends, or participating in campus activities.",
    field: "q1_interest",
  },
  {
    id: "q2_depressed",
    text: "Feeling consistently sad, low, or hopeless about your future career or academic path.",
    field: "q2_depressed",
  },
  {
    id: "q3_sleep",
    text: "Trouble falling asleep, staying asleep, or, conversely, sleeping much more than usual (even during non-exam periods).",
    field: "q3_sleep",
  },
  {
    id: "q4_energy",
    text: "Feeling drained, physically exhausted, or having so little energy that it interferes with attending lectures or studying.",
    field: "q4_energy",
  },
  {
    id: "q5_appetite",
    text: "Having a noticeably poor appetite or overeating/stress-eating, perhaps skipping meals or excessive snacking.",
    field: "q5_appetite",
  },
  {
    id: "q6_failure",
    text: "Feeling like a failure, letting your family down, or being substantially behind your peers in academic progress.",
    field: "q6_failure",
  },
  {
    id: "q7_concentration",
    text: "Trouble focusing your attention on academic tasks, reading textbooks, or concentrating during online classes.",
    field: "q7_concentration",
  },
  {
    id: "q8_movement",
    text: "Moving or speaking so slowly that other people notice, or conversely, being so restless or fidgety that you can't sit still (e.g., during viva/presentations).",
    field: "q8_movement",
  },
  {
    id: "q9_harm",
    text: "Thoughts that you would be better off dead, or thoughts of hurting yourself.",
    field: "q9_harm",
  },
];

const options = [
  { value: "0", label: "Not at all" },
  { value: "1", label: "Several Days" },
  { value: "2", label: "More than half the time" },
  { value: "3", label: "Nearly every day" },
];

export default function PHQ9SurveyForm({ studentId, onComplete }: PHQ9FormProps) {
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
        const severity = totalScore <= 4 ? "NONE" : totalScore <= 9 ? "MILD" : totalScore <= 14 ? "MODERATE" : totalScore <= 19 ? "MODERATELY_SEVERE" : "SEVERE";
        await saveDemoPhq9Survey({
          studentId,
          q1_little_interest: answers.q1_interest,
          q2_depressed: answers.q2_depressed,
          q3_sleep_trouble: answers.q3_sleep,
          q4_tired: answers.q4_energy,
          q5_appetite: answers.q5_appetite,
          q6_bad_about_self: answers.q6_failure,
          q7_concentration: answers.q7_concentration,
          q8_restless: answers.q8_movement,
          q9_suicide_thoughts: answers.q9_harm,
          totalScore,
          severity,
        });
        window.dispatchEvent(new Event("demo-data-updated"));
        const demoResult = { id: `phq9-${Date.now()}`, totalScore, severity, completedAt: new Date().toISOString() };
        setResult(demoResult);
        setSubmitted(true);
        onComplete?.({ success: true, survey: demoResult });
        return;
      }

      const response = await fetch("/api/phq9-survey", {
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
      NONE: {
        label: "Minimal or None",
        color: "text-green-600",
        description: "Your responses suggest minimal to no depression symptoms.",
      },
      MILD: {
        label: "Mild Depression",
        color: "text-yellow-600",
        description: "Your responses suggest mild depression symptoms. Consider speaking with a counselor.",
      },
      MODERATE: {
        label: "Moderate Depression",
        color: "text-orange-600",
        description: "Your responses suggest moderate depression. We recommend seeking support from a mental health professional.",
      },
      MODERATELY_SEVERE: {
        label: "Moderately Severe Depression",
        color: "text-red-600",
        description: "Your responses indicate moderately severe depression. Please reach out to a mental health professional soon.",
      },
      SEVERE: {
        label: "Severe Depression",
        color: "text-red-700",
        description: "Your responses indicate severe depression. We strongly encourage you to speak with a mental health professional immediately.",
      },
    };

    return severityMap[severity] || severityMap.NONE;
  };

  if (submitted && result) {
    const severityInfo = getSeverityInfo(result.severity);

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-sky-400/10 to-slate-400/5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <CardTitle className="text-2xl font-heading">Survey Completed</CardTitle>
              <CardDescription className="font-body">
                Thank you for completing the PHQ-9 assessment
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <Alert>
            <Heart className="w-4 h-4" />
            <AlertTitle className="font-heading">Your Results</AlertTitle>
            <AlertDescription className="font-body">
              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Score:</span>
                  <span className="text-2xl font-bold text-primary">{result.totalScore}/27</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Assessment:</span>
                  <span className={`text-lg font-semibold ${severityInfo.color}`}>
                    {severityInfo.label}
                  </span>
                </div>
                <p className="text-sm mt-4 p-3 bg-muted rounded-lg">
                  {severityInfo.description}
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {result.severity !== "NONE" && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle className="font-heading">Need Support?</AlertTitle>
              <AlertDescription className="font-body">
                <p className="mb-3">
                  If you&apos;re experiencing distress, please don&apos;t hesitate to reach out for support:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Contact your campus counseling center</li>
                  <li>Speak with your academic mentor or advisor</li>
                  <li>Call a crisis helpline: <strong>KIRAN (1800-599-0019)</strong></li>
                  <li>Visit our Resource Hub for immediate coping strategies</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => window.location.href = "/dashboard"}
              className="flex-1 font-accent"
            >
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-sky-400/10 to-slate-400/5">
        <CardTitle className="text-2xl font-heading">PHQ-9 Mental Health Survey</CardTitle>
        <CardDescription className="font-body">
          Over the last 2 weeks, how often have you been bothered by the following?
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="p-4 sm:p-6 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
            >
              <Label className="text-sm sm:text-base font-medium font-heading mb-4 block">
                <span className="text-primary font-bold">Q{index + 1}.</span> {question.text}
                <span className="text-red-500 ml-1">*</span>
              </Label>

              <RadioGroup
                onValueChange={(value) => handleAnswerChange(question.field, value)}
                value={answers[question.field]?.toString()}
                className="space-y-3 mt-4"
              >
                {options.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`${question.id}-${option.value}`}
                      className="text-primary"
                    />
                    <Label
                      htmlFor={`${question.id}-${option.value}`}
                      className="flex-1 cursor-pointer font-body text-sm sm:text-base"
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
              <AlertTitle className="font-heading">Error</AlertTitle>
              <AlertDescription className="font-body">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              type="submit"
              disabled={!isAllAnswered() || submitting}
              className="flex-1 bg-medicalBlue hover:bg-medicalBlue-dark font-accent"
            >
              {submitting ? "Submitting..." : "Submit Survey"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.href = "/dashboard"}
              className="flex-1 font-accent"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground font-body mt-4">
            Your responses are confidential and will be used to provide you with appropriate support
            and resources.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
