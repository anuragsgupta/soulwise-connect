// Example: Sentiment Analysis Dashboard Component
// Shows how to use the sentiment analysis queries in your UI

'use client';

import { useEffect, useState } from 'react';
import {
  getChatHistoryWithSentiment,
  getSentimentTrend,
  getConversationContext,
  calculateWellnessScore,
  detectConcerningPatterns,
  formatEmotionDisplay,
  getSentimentColor,
  getRiskLevelColor,
} from '@/lib/sentimentQueries';
import type { SentimentMessage, SentimentTrendDay } from '@/lib/sentimentQueries';

interface SentimentDashboardProps {
  userId: string;
}

export default function SentimentDashboard({ userId }: SentimentDashboardProps) {
  const [messages, setMessages] = useState<SentimentMessage[]>([]);
  const [trend, setTrend] = useState<SentimentTrendDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [wellnessScore, setWellnessScore] = useState(50);
  const [patterns, setPatterns] = useState<{ hasConcerningPattern: boolean; patterns: string[]; recommendations: string[] }>();

  useEffect(() => {
    loadSentimentData();
  }, [userId]);

  const loadSentimentData = async () => {
    setLoading(true);
    
    try {
      // Load chat history
      const historyResult = await getChatHistoryWithSentiment(userId, 50);
      if (historyResult.success && historyResult.data) {
        setMessages(historyResult.data.messages);
        
        // Calculate wellness score
        const score = calculateWellnessScore(historyResult.data.messages);
        setWellnessScore(score);
      }
      
      // Load sentiment trend
      const trendResult = await getSentimentTrend(userId, 7);
      if (trendResult.success && trendResult.data) {
        setTrend(trendResult.data.trend);
        
        // Detect concerning patterns
        const analysis = detectConcerningPatterns(trendResult.data.trend);
        setPatterns(analysis);
      }
    } catch (error) {
      console.error('Failed to load sentiment data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Wellness Score Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Overall Wellness Score</h2>
        <div className="flex items-center space-x-4">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={wellnessScore >= 70 ? '#10b981' : wellnessScore >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(wellnessScore / 100) * 351.86} 351.86`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold">{wellnessScore}</span>
            </div>
          </div>
          <div>
            <p className="text-gray-600">
              {wellnessScore >= 70 && '😊 Doing well! Keep it up.'}
              {wellnessScore >= 40 && wellnessScore < 70 && '😐 Some ups and downs. Consider support.'}
              {wellnessScore < 40 && '😢 Concerning. Please seek help.'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Based on {messages.length} messages over the past week
            </p>
          </div>
        </div>
      </div>

      {/* Concerning Patterns Alert */}
      {patterns?.hasConcerningPattern && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">⚠️ Concerning Patterns Detected</h3>
          <ul className="list-disc list-inside space-y-1 text-red-700 text-sm mb-3">
            {patterns.patterns.map((pattern, i) => (
              <li key={i}>{pattern}</li>
            ))}
          </ul>
          <div className="bg-white rounded p-3 mt-3">
            <p className="text-sm font-medium text-gray-800 mb-1">Recommendations:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              {patterns.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Sentiment Trend Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">7-Day Sentiment Trend</h2>
        <div className="space-y-3">
          {trend.map((day) => {
            const total = day.total || 1;
            const positivePercent = (day.positive / total) * 100;
            const neutralPercent = (day.neutral / total) * 100;
            const negativePercent = (day.negative / total) * 100;

            return (
              <div key={day.date} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-gray-600">{day.total} messages</span>
                </div>
                <div className="flex h-6 rounded overflow-hidden">
                  {day.positive > 0 && (
                    <div
                      className="bg-green-500 flex items-center justify-center text-white text-xs"
                      style={{ width: `${positivePercent}%` }}
                      title={`${day.positive} positive (${positivePercent.toFixed(0)}%)`}
                    >
                      {positivePercent > 10 && `${positivePercent.toFixed(0)}%`}
                    </div>
                  )}
                  {day.neutral > 0 && (
                    <div
                      className="bg-gray-400 flex items-center justify-center text-white text-xs"
                      style={{ width: `${neutralPercent}%` }}
                      title={`${day.neutral} neutral (${neutralPercent.toFixed(0)}%)`}
                    >
                      {neutralPercent > 10 && `${neutralPercent.toFixed(0)}%`}
                    </div>
                  )}
                  {day.negative > 0 && (
                    <div
                      className="bg-red-500 flex items-center justify-center text-white text-xs"
                      style={{ width: `${negativePercent}%` }}
                      title={`${day.negative} negative (${negativePercent.toFixed(0)}%)`}
                    >
                      {negativePercent > 10 && `${negativePercent.toFixed(0)}%`}
                    </div>
                  )}
                </div>
                {day.riskEvents > 0 && (
                  <p className="text-xs text-red-600 font-medium">
                    🚨 {day.riskEvents} risk event{day.riskEvents > 1 ? 's' : ''} detected
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Messages with Sentiment */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.slice(-10).reverse().map((msg) => {
            const sentimentColor = getSentimentColor(msg.sentiment.label);
            const riskColor = getRiskLevelColor(msg.riskLevel);
            const emotions = formatEmotionDisplay(msg.emotions);

            return (
              <div key={msg.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${msg.role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {msg.role === 'user' ? '👤 You' : '🤖 Bot'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${sentimentColor.bg} ${sentimentColor.text}`}>
                        {sentimentColor.icon} {msg.sentiment.label}
                      </span>
                      {msg.role === 'user' && msg.riskLevel !== 'normal' && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${riskColor.bg} ${riskColor.text}`}>
                          ⚠️ {msg.riskLevel}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{msg.message}</p>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                {msg.role === 'user' && emotions.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {emotions.slice(0, 3).map((emotion) => (
                      <span
                        key={emotion.name}
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: `${emotion.color}20`,
                          color: emotion.color,
                        }}
                      >
                        {emotion.emoji} {emotion.name} {emotion.value}%
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
