'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getDemoMoodCheckIns } from '@/lib/demoDB';

interface MoodEntry {
  date: string;
  mood: number;
  label: string;
  emoji: string;
}

interface MoodStats {
  lastThreeDays: MoodEntry[];
  averageMood: number;
  sevenDayTrend: number[];
  trend: 'improving' | 'declining' | 'stable';
}

const moodEmojis = ['😢', '😞', '😐', '🙂', '😊', '😄', '🤩'];
const moodLabels = ['Terrible', 'Bad', 'Okay', 'Neutral', 'Good', 'Great', 'Amazing'];

export default function MoodStatsWidget({ isDemoUser = true }: { isDemoUser?: boolean }) {
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMoodStats();
  }, []);

  const loadMoodStats = async () => {
    try {
      if (isDemoUser) {
        const moodData = await getDemoMoodCheckIns(7);
        
        if (moodData && moodData.length > 0) {
          // Sort by date descending (most recent first)
          const sorted = [...moodData].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          // Last 3 days
          const lastThreeDays: MoodEntry[] = sorted.slice(0, 3).map((entry) => ({
            date: formatDate(entry.date),
            mood: entry.mood,
            label: moodLabels[Math.max(0, Math.min(6, entry.mood - 1))] || 'Neutral',
            emoji: moodEmojis[Math.max(0, Math.min(6, entry.mood - 1))] || '😐',
          }));

          // Calculate average
          const averageMood =
            moodData.reduce((sum, entry) => sum + entry.mood, 0) / moodData.length;

          // 7-day trend
          const sevenDayTrend = sorted
            .slice(0, 7)
            .reverse()
            .map((entry) => entry.mood);

          // Determine trend
          let trend: 'improving' | 'declining' | 'stable' = 'stable';
          if (sevenDayTrend.length >= 2) {
            const recentAvg = sevenDayTrend.slice(-3).reduce((a, b) => a + b, 0) / 3;
            const olderAvg = sevenDayTrend.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
            if (recentAvg > olderAvg + 0.5) trend = 'improving';
            else if (recentAvg < olderAvg - 0.5) trend = 'declining';
          }

          setStats({
            lastThreeDays,
            averageMood,
            sevenDayTrend,
            trend,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load mood stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mood Insights</h2>
        <p className="text-sm text-gray-600">Your emotional well-being at a glance</p>
      </div>

      {/* Average Mood Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">Average Mood (Last 7 Days)</p>
            <div className="flex items-center gap-3">
              <span className="text-5xl">
                {moodEmojis[Math.max(0, Math.min(6, Math.round(stats.averageMood) - 1))] || '😊'}
              </span>
              <div>
                <div className="text-4xl font-bold text-gray-900">
                  {stats.averageMood.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">out of 7</div>
              </div>
            </div>
          </div>

          {/* Trend Indicator */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-2">
              {stats.trend === 'improving' && (
                <>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-lg font-semibold text-green-600">Improving</span>
                </>
              )}
              {stats.trend === 'declining' && (
                <>
                  <TrendingDown className="w-5 h-5 text-orange-500" />
                  <span className="text-lg font-semibold text-orange-600">Declining</span>
                </>
              )}
              {stats.trend === 'stable' && (
                <>
                  <Minus className="w-5 h-5 text-blue-500" />
                  <span className="text-lg font-semibold text-blue-600">Stable</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500">Compared to earlier period</p>
          </div>
        </div>
      </div>

      {/* Last 3-4 Days */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Mood Check-Ins</h3>
        <div className="space-y-3">
          {stats.lastThreeDays.map((entry, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{entry.emoji}</span>
                <div>
                  <p className="font-medium text-gray-900">{entry.label}</p>
                  <p className="text-sm text-gray-500">{entry.date}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{entry.mood}</div>
                <div className="text-xs text-gray-500">mood score</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Trends (Last 7 Days)</h3>

        {/* Mini Chart */}
        <div className="flex items-end justify-between h-32 gap-2 mb-6 px-2">
          {stats.sevenDayTrend.map((mood, idx) => {
            const height = (mood / 7) * 100;
            const color = mood <= 2 ? 'bg-red-400' : mood <= 4 ? 'bg-yellow-400' : 'bg-green-400';

            return (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div
                  className={`w-full ${color} rounded-t-lg transition-all hover:opacity-80`}
                  style={{ height: `${height}%`, minHeight: '4px' }}
                  title={`Day ${idx + 1}: Mood ${mood}`}
                />
                <p className="text-xs text-gray-500 mt-2">D{idx + 1}</p>
              </div>
            );
          })}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 mb-1">Best Day</p>
            <p className="text-xl font-bold text-green-600">
              {Math.max(...stats.sevenDayTrend)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 mb-1">Average</p>
            <p className="text-xl font-bold text-blue-600">
              {(
                stats.sevenDayTrend.reduce((a, b) => a + b, 0) / stats.sevenDayTrend.length
              ).toFixed(1)}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 mb-1">Lowest Day</p>
            <p className="text-xl font-bold text-orange-600">
              {Math.min(...stats.sevenDayTrend)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Quick Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ Daily check-ins help you understand your patterns</li>
          <li>✓ Track what affects your mood (sleep, exercise, social time)</li>
          <li>✓ Share insights with your counselor for personalized support</li>
        </ul>
      </div>
    </div>
  );
}
