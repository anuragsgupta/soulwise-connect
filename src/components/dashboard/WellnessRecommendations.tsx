"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  BookOpen, 
  Brain, 
  Heart, 
  MessageCircle,
  Video,
  Headphones,
  Activity,
  Smartphone,
  ChevronRight,
  Gamepad2
} from "lucide-react";

interface RecommendationResource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'exercise' | 'meditation' | 'activity' | 'chat' | 'game';
  icon: any;
  action: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  url?: string;
  tabTarget?: 'mood' | 'chat' | 'mentor' | 'diary' | 'tasks' | 'calendar' | 'appointments' | 'resources' | 'forum';
  gameId?: string; // For triggering specific games
  videoId?: string; // For YouTube videos to play in-app
  duration?: string; // Video duration
}

interface WellnessRecommendationsProps {
  studentId: string;
  wellnessScore: number;
  onResourceClick?: (resource: RecommendationResource) => void;
}

export default function WellnessRecommendations({ 
  studentId, 
  wellnessScore,
  onResourceClick 
}: WellnessRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentMoods, setRecentMoods] = useState<any[]>([]);

  useEffect(() => {
    fetchRecommendations();
  }, [studentId, wellnessScore]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);

      // Fetch recent mood data
      const moodResponse = await fetch(`/api/mood-checkin/enhanced?studentId=${studentId}&days=7`);
      const moodData = await moodResponse.json();

      let moodLogs = [];
      let todayMood = null;

      if (moodData.success && moodData.data) {
        moodLogs = moodData.data.recentCheckIns || [];
        todayMood = moodData.data.todayCheckIn;
      }
      
      // Generate recommendations based on wellness score and mood patterns
      const generatedRecommendations = generateRecommendations(
        wellnessScore, 
        moodLogs,
        todayMood
      );
      
      setRecommendations(generatedRecommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Still generate basic recommendations even if mood fetch fails
      const basicRecommendations = generateRecommendations(wellnessScore, [], null);
      setRecommendations(basicRecommendations);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (
    score: number, 
    moodLogs: any[],
    todayMood: any
  ): RecommendationResource[] => {
    const recommendations: RecommendationResource[] = [];

    console.log('Generating recommendations for score:', score);
    console.log('Mood logs count:', moodLogs.length);

    // Analyze mood patterns
    const avgMood = moodLogs.length > 0 
      ? moodLogs.reduce((sum, log) => sum + log.moodScore, 0) / moodLogs.length 
      : 3;
    
    const hasLowMoods = moodLogs.some(log => log.moodScore <= 2);
    const hasAnxiety = moodLogs.some(log => log.anxietyLevel >= 4);
    const hasStress = moodLogs.some(log => log.stressLevel >= 4);
    const hasSleepIssues = moodLogs.some(log => log.sleepQuality <= 2);

    console.log('Mood analysis:', { avgMood, hasLowMoods, hasAnxiety, hasStress, hasSleepIssues });

    // Critical wellness score (< 40)
    if (score < 40) {
      recommendations.push({
        id: 'breathing-ball-game',
        title: 'Breathing Ball Game',
        description: 'Interactive breathing exercise to reduce stress and anxiety',
        type: 'game',
        icon: Gamepad2,
        action: 'Play Now',
        priority: 'high',
        category: 'game-breathing',
        tabTarget: 'resources',
        gameId: 'breathing-ball'
      });
      
      recommendations.push({
        id: 'box-breathing-crisis',
        title: 'Box Breathing Exercise',
        description: 'Guided breathing pattern to calm overwhelming emotions',
        type: 'game',
        icon: Gamepad2,
        action: 'Play Now',
        priority: 'high',
        category: 'game-crisis',
        tabTarget: 'resources',
        gameId: 'box-breathing'
      });

      recommendations.push({
        id: 'falling-leaves-crisis',
        title: 'Grounding Exercise',
        description: 'Calming visualization to help you feel centered',
        type: 'game',
        icon: Gamepad2,
        action: 'Play Now',
        priority: 'high',
        category: 'game-grounding',
        tabTarget: 'resources',
        gameId: 'falling-leaves'
      });
    }

    // Low wellness score (40-60)
    if (score >= 40 && score < 60) {
      recommendations.push({
        id: 'breathing-ball-game',
        title: 'Breathing Ball Game',
        description: 'Interactive breathing exercise to reduce stress and anxiety',
        type: 'game',
        icon: Gamepad2,
        action: 'Play Now',
        priority: 'high',
        category: 'game-breathing',
        tabTarget: 'resources',
        gameId: 'breathing-ball'
      });

      recommendations.push({
        id: 'calm-circle-low',
        title: 'Calm Circle Game',
        description: 'Peaceful visualization exercise to center your thoughts',
        type: 'game',
        icon: Gamepad2,
        action: 'Play Now',
        priority: 'medium',
        category: 'game-mindfulness',
        tabTarget: 'resources',
        gameId: 'calm-circle'
      });

      recommendations.push({
        id: 'mandala-low',
        title: 'Mandala Color Therapy',
        description: 'Creative coloring game to boost mood and reduce stress',
        type: 'game',
        icon: Gamepad2,
        action: 'Play Now',
        priority: 'medium',
        category: 'game-creative',
        tabTarget: 'resources',
        gameId: 'mandala-coloring'
      });
    }

    // Moderate wellness score (60-75)
    if (score >= 60 && score < 75) {
      recommendations.push({
        id: 'calm-circle-game',
        title: 'Calm Circle Game',
        description: 'Peaceful visualization exercise to center your thoughts',
        type: 'game',
        icon: Gamepad2,
        action: 'Play Now',
        priority: 'medium',
        category: 'game-mindfulness',
        tabTarget: 'resources',
        gameId: 'calm-circle'
      });

      recommendations.push({
        id: 'breathing-ball-moderate',
        title: 'Breathing Ball Game',
        description: 'Interactive breathing exercise to maintain calmness',
        type: 'game',
        icon: Gamepad2,
        action: 'Play Now',
        priority: 'medium',
        category: 'game-breathing',
        tabTarget: 'resources',
        gameId: 'breathing-ball'
      });

      recommendations.push({
        id: 'box-breathing-moderate',
        title: 'Box Breathing Exercise',
        description: 'Structured breathing pattern for relaxation',
        type: 'game',
        icon: Gamepad2,
        action: 'Play Now',
        priority: 'medium',
        category: 'game-breathing',
        tabTarget: 'resources',
        gameId: 'box-breathing'
      });
    }

    // Good wellness score (75+)
    if (score >= 75) {
      recommendations.push({
        id: 'zen-water-ripple',
        title: 'Zen Water Ripple',
        description: 'Meditative game to maintain mindfulness and relaxation',
        type: 'game',
        icon: Gamepad2,
        action: 'Play Now',
        priority: 'low',
        category: 'game-zen',
        tabTarget: 'resources',
        gameId: 'zen-water-ripple'
      });

      recommendations.push({
        id: 'mandala-high',
        title: 'Mandala Color Therapy',
        description: 'Relaxing creative activity to maintain mindfulness',
        type: 'game',
        icon: Gamepad2,
        action: 'Play Now',
        priority: 'low',
        category: 'game-creative',
        tabTarget: 'resources',
        gameId: 'mandala-coloring'
      });

      recommendations.push({
        id: 'calm-circle-high',
        title: 'Calm Circle Game',
        description: 'Peaceful visualization to keep your mind centered',
        type: 'game',
        icon: Gamepad2,
        action: 'Play Now',
        priority: 'low',
        category: 'game-mindfulness',
        tabTarget: 'resources',
        gameId: 'calm-circle'
      });
    }

    // Specific mood-based recommendations
    if (hasAnxiety) {
      recommendations.push({
        id: 'box-breathing-game',
        title: 'Box Breathing Game',
        description: 'Guided 4-4-4-4 breathing pattern to reduce anxiety instantly',
        type: 'game',
        icon: Gamepad2,
        action: 'Play Now',
        priority: 'high',
        category: 'game-anxiety',
        tabTarget: 'resources',
        gameId: 'box-breathing'
      });
    }

    if (hasStress) {
      recommendations.push({
        id: 'falling-leaves-game',
        title: 'Falling Leaves Grounding',
        description: 'Calming grounding exercise to release stress and tension',
        type: 'game',
        icon: Gamepad2,
        action: 'Play Now',
        priority: 'high',
        category: 'game-stress',
        tabTarget: 'resources',
        gameId: 'falling-leaves'
      });
    }

    if (hasSleepIssues) {
      recommendations.push({
        id: 'zen-water-sleep',
        title: 'Zen Water Ripple',
        description: 'Meditative game to calm your mind before sleep',
        type: 'game',
        icon: Gamepad2,
        action: 'Play Now',
        priority: 'medium',
        category: 'game-sleep',
        tabTarget: 'resources',
        gameId: 'zen-water-ripple'
      });
    }

    if (avgMood <= 2.5) {
      recommendations.push({
        id: 'mandala-color-picker',
        title: 'Mandala Color Therapy',
        description: 'Creative coloring game to boost mood and reduce negative thoughts',
        type: 'game',
        icon: Gamepad2,
        action: 'Play Now',
        priority: 'high',
        category: 'game-mood',
        tabTarget: 'resources',
        gameId: 'mandala-coloring'
      });
    }

    // Sort by priority and limit to top 3-4
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    const sorted = recommendations
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 4);
    
    console.log('Generated recommendations:', sorted.length);
    return sorted;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getIconColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 px-1 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
          <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
          Wellness Recommendations
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    console.log('No recommendations to show');
    return null;
  }

  console.log('Rendering recommendations:', recommendations);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
          <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
          Recommended For You
        </h2>
        <Badge variant="outline" className="bg-white text-xs transition-all duration-300 hover:scale-110 hover:bg-purple-50 border-purple-200">
          {recommendations.length}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {recommendations.map((rec, index) => {
          const IconComponent = rec.icon;
          return (
            <div
              key={rec.id}
              className="flex flex-col items-center p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 hover:border-purple-300 hover:bg-white/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
              onClick={() => onResourceClick?.(rec)}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.5s ease-out forwards'
              }}
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/0 to-pink-100/0 group-hover:from-purple-100/50 group-hover:to-pink-100/50 transition-all duration-500 rounded-2xl" />
              
              {/* Priority Badge with Pulse */}
              {rec.priority === 'high' && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-bounce z-10">
                  <span className="text-white text-[10px] font-bold">!</span>
                </div>
              )}
              
              {/* Icon Circle with Enhanced Animation */}
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                rec.priority === 'high' ? 'from-red-500 to-orange-500' :
                rec.priority === 'medium' ? 'from-yellow-500 to-amber-500' :
                'from-green-500 to-emerald-500'
              } flex items-center justify-center mb-2 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-md group-hover:shadow-2xl relative z-10`}>
                <IconComponent className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" />
                
                {/* Ripple Effect on Hover */}
                <div className="absolute inset-0 rounded-full bg-white/30 scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700" />
              </div>
              
              {/* Title with Smooth Color Transition */}
              <h4 className="font-semibold text-xs text-center text-gray-800 group-hover:text-purple-700 transition-colors duration-300 line-clamp-2 leading-tight relative z-10">
                {rec.title}
              </h4>
              
              {/* Type Badge with Hover Effect */}
              <Badge 
                variant="secondary" 
                className="mt-2 text-[10px] px-2 py-0 h-5 group-hover:scale-110 transition-transform duration-300 relative z-10"
              >
                {rec.type === 'game' ? '🎮' : rec.type === 'video' ? '📹' : rec.type === 'article' ? '📄' : '✨'}
              </Badge>
            </div>
          );
        })}
      </div>
      
      {/* Add Keyframes for Fade In Animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Import Moon icon
import { Moon, Calendar, Users } from "lucide-react";
