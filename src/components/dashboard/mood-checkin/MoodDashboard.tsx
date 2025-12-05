"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Brain, Heart, Activity, Moon, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MoodCheckIn {
  id: string;
  moodScore: number;
  moodLabel: string;
  factors: Record<string, number>;
  notes: string | null;
  checkInDate: string;
  createdAt: string;
}

interface MoodDashboardProps {
  onStartCheckIn: () => void;
  todayCheckIn: MoodCheckIn | null;
}

const moodEmojis: Record<string, string> = {
  "Terrible": "😢",
  "Bad": "😞",
  "Okay": "😐",
  "Good": "🙂",
  "Great": "😊",
  "Amazing": "😄",
  "Awesome": "🤩"
};

const factorIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  sleep: Moon,
  energy: Zap,
  stress: Brain,
  social: Heart,
  exercise: Activity
};

export default function MoodDashboard({ onStartCheckIn, todayCheckIn }: MoodDashboardProps) {
  const { user } = useAuth();
  const [moodHistory, setMoodHistory] = useState<MoodCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<{
    averageMood: number;
    trend: "improving" | "declining" | "stable";
    topFactors: Array<{ name: string; avgScore: number }>;
    streak: number;
  } | null>(null);

  useEffect(() => {
    fetchMoodHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, todayCheckIn]);

  const fetchMoodHistory = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/mood-checkin/enhanced?studentId=${user.id}&days=30`);
      const result = await response.json();

      if (result.success && result.data.moodCheckIns) {
        setMoodHistory(result.data.moodCheckIns);
        calculateInsights(result.data.moodCheckIns);
      }
    } catch (error) {
      console.error("Failed to fetch mood history:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateInsights = (checkIns: MoodCheckIn[]) => {
    if (checkIns.length === 0) {
      setInsights(null);
      return;
    }

    // Calculate average mood
    const avgMood = checkIns.reduce((sum, c) => sum + c.moodScore, 0) / checkIns.length;

    // Calculate trend (compare first half vs second half)
    const midpoint = Math.floor(checkIns.length / 2);
    const recentAvg = checkIns.slice(0, midpoint).reduce((sum, c) => sum + c.moodScore, 0) / midpoint;
    const olderAvg = checkIns.slice(midpoint).reduce((sum, c) => sum + c.moodScore, 0) / (checkIns.length - midpoint);
    
    let trend: "improving" | "declining" | "stable" = "stable";
    if (recentAvg > olderAvg + 0.5) trend = "improving";
    else if (recentAvg < olderAvg - 0.5) trend = "declining";

    // Calculate top factors
    const factorAverages: Record<string, { sum: number; count: number }> = {};
    checkIns.forEach(checkIn => {
      if (checkIn.factors) {
        Object.entries(checkIn.factors).forEach(([factor, value]) => {
          if (!factorAverages[factor]) {
            factorAverages[factor] = { sum: 0, count: 0 };
          }
          factorAverages[factor].sum += value as number;
          factorAverages[factor].count += 1;
        });
      }
    });

    const topFactors = Object.entries(factorAverages)
      .map(([name, { sum, count }]) => ({ name, avgScore: sum / count }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 3);

    // Calculate streak - count consecutive days starting from today
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    
    // Sort check-ins by date descending (most recent first)
    const sortedCheckIns = [...checkIns].sort((a, b) => 
      new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime()
    );
    
    // Check if there's a check-in today
    if (sortedCheckIns.length > 0) {
      const mostRecentDate = new Date(sortedCheckIns[0].checkInDate);
      mostRecentDate.setHours(0, 0, 0, 0);
      
      // Start counting streak from today or yesterday (grace period)
      const daysDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0 || daysDiff === 1) {
        // Build a set of check-in dates for fast lookup
        const checkInDates = new Set(
          sortedCheckIns.map(c => {
            const d = new Date(c.checkInDate);
            d.setHours(0, 0, 0, 0);
            return d.toDateString();
          })
        );
        
        // Count consecutive days going backwards from most recent check-in
        let checkDate = new Date(mostRecentDate);
        while (checkInDates.has(checkDate.toDateString())) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }
    }

    setInsights({
      averageMood: avgMood,
      trend,
      topFactors,
      streak
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Header with Check-in Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mood Tracker</h2>
          <p className="text-gray-500">Track and understand your emotional patterns</p>
        </div>
        <Button
          onClick={onStartCheckIn}
          className="bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          {todayCheckIn ? "Update Today's Mood" : "Check In Now"}
        </Button>
      </div>

      {/* Self-Awareness Insights */}
      {insights && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
          <div className="flex items-center mb-4">
            <Brain className="w-6 h-6 text-purple-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-800">Your Self-Awareness Insights</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Average Mood */}
            <div className="bg-white/80 backdrop-blur rounded-xl p-4">
              <div className="text-sm text-gray-600 mb-1">Average Mood</div>
              <div className="flex items-center">
                <span className="text-3xl mr-2">{moodEmojis[Object.keys(moodEmojis)[Math.round(insights.averageMood) - 1]] || "😊"}</span>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{insights.averageMood.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">out of 7</div>
                </div>
              </div>
            </div>

            {/* Trend */}
            <div className="bg-white/80 backdrop-blur rounded-xl p-4">
              <div className="text-sm text-gray-600 mb-1">Recent Trend</div>
              <div className="flex items-center">
                {insights.trend === "improving" && (
                  <>
                    <TrendingUp className="w-8 h-8 text-green-500 mr-2" />
                    <span className="text-lg font-semibold text-green-600">Improving</span>
                  </>
                )}
                {insights.trend === "declining" && (
                  <>
                    <TrendingUp className="w-8 h-8 text-orange-500 mr-2 rotate-180" />
                    <span className="text-lg font-semibold text-orange-600">Needs attention</span>
                  </>
                )}
                {insights.trend === "stable" && (
                  <>
                    <Activity className="w-8 h-8 text-blue-500 mr-2" />
                    <span className="text-lg font-semibold text-blue-600">Stable</span>
                  </>
                )}
              </div>
            </div>

            {/* Streak */}
            <div className="bg-white/80 backdrop-blur rounded-xl p-4">
              <div className="text-sm text-gray-600 mb-1">Check-in Streak</div>
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-teal-500 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-gray-800">{insights.streak}</div>
                  <div className="text-xs text-gray-500">days in a row</div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Factors */}
          {insights.topFactors.length > 0 && (
            <div className="bg-white/80 backdrop-blur rounded-xl p-4">
              <div className="text-sm font-medium text-gray-700 mb-3">Strongest Factors</div>
              <div className="grid grid-cols-3 gap-3">
                {insights.topFactors.map((factor) => {
                  const Icon = factorIcons[factor.name.toLowerCase()] || Activity;
                  return (
                    <div key={factor.name} className="flex items-center space-x-2">
                      <Icon className="w-5 h-5 text-teal-600" />
                      <div>
                        <div className="text-sm font-medium capitalize">{factor.name}</div>
                        <div className="text-xs text-gray-500">{factor.avgScore.toFixed(1)}/5</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Personalized Message */}
          <div className="mt-4 p-3 bg-purple-100/50 rounded-lg">
            <p className="text-sm text-gray-700">
              {insights.trend === "improving" && "🎉 Great progress! Your mood has been improving. Keep up the positive momentum!"}
              {insights.trend === "declining" && "💙 You might be going through a rough patch. Consider talking to someone or trying mood-boosting activities."}
              {insights.trend === "stable" && "✨ Your mood has been consistent. Continue with what's working well for you!"}
            </p>
          </div>
        </div>
      )}

      {/* Mood History Feed */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Check-ins</h3>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading your mood history...</div>
        ) : moodHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">📊</div>
            <p className="text-gray-600 mb-4">No mood check-ins yet</p>
            <Button onClick={onStartCheckIn} variant="outline">
              Start Your First Check-in
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {moodHistory.map((checkIn) => (
              <div
                key={checkIn.id}
                className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="text-4xl">{moodEmojis[checkIn.moodLabel] || "😊"}</div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-gray-800">{checkIn.moodLabel}</div>
                    <div className="text-sm text-gray-500">{formatDate(checkIn.checkInDate)}</div>
                  </div>
                  
                  {checkIn.factors && Object.keys(checkIn.factors).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {Object.entries(checkIn.factors).map(([factor, value]) => {
                        const Icon = factorIcons[factor] || Activity;
                        return (
                          <div key={factor} className="flex items-center text-xs bg-white px-2 py-1 rounded-full border border-gray-200">
                            <Icon className="w-3 h-3 mr-1 text-gray-600" />
                            <span className="capitalize">{factor}: {value}/5</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {checkIn.notes && (
                    <p className="text-sm text-gray-600 italic">&ldquo;{checkIn.notes}&rdquo;</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
