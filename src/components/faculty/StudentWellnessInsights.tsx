"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle,
  Activity,
  Smile,
  Meh,
  Frown
} from "lucide-react";

interface WellnessData {
  studentId: string;
  studentName: string;
  overallScore: number;
  moodScore: number;
  phq9Score: number;
  gad7Score: number;
  chatbotScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
}

const StudentWellnessInsights = () => {
  const [studentsData, setStudentsData] = useState<WellnessData[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - Replace with actual API call
  useEffect(() => {
    setTimeout(() => {
      const mockData: WellnessData[] = [
        {
          studentId: "1",
          studentName: "Aarav Sharma",
          overallScore: 35,
          moodScore: 2.1,
          phq9Score: 18,
          gad7Score: 16,
          chatbotScore: 42,
          riskLevel: 'critical',
          lastUpdated: '2 hours ago'
        },
        {
          studentId: "2",
          studentName: "Priya Patel",
          overallScore: 52,
          moodScore: 3.2,
          phq9Score: 12,
          gad7Score: 10,
          chatbotScore: 58,
          riskLevel: 'medium',
          lastUpdated: '5 hours ago'
        },
        {
          studentId: "3",
          studentName: "Rahul Gupta",
          overallScore: 78,
          moodScore: 4.1,
          phq9Score: 5,
          gad7Score: 4,
          chatbotScore: 82,
          riskLevel: 'low',
          lastUpdated: '1 day ago'
        },
        {
          studentId: "4",
          studentName: "Sneha Reddy",
          overallScore: 45,
          moodScore: 2.8,
          phq9Score: 14,
          gad7Score: 13,
          chatbotScore: 48,
          riskLevel: 'high',
          lastUpdated: '3 hours ago'
        },
        {
          studentId: "5",
          studentName: "Arjun Mehta",
          overallScore: 85,
          moodScore: 4.5,
          phq9Score: 3,
          gad7Score: 2,
          chatbotScore: 90,
          riskLevel: 'low',
          lastUpdated: '6 hours ago'
        }
      ];
      setStudentsData(mockData);
      setLoading(false);
    }, 500);
  }, []);

  // Calculate aggregate statistics
  const stats = {
    totalStudents: studentsData.length,
    avgWellness: Math.round(studentsData.reduce((sum, s) => sum + s.overallScore, 0) / studentsData.length),
    criticalCount: studentsData.filter(s => s.riskLevel === 'critical').length,
    highRiskCount: studentsData.filter(s => s.riskLevel === 'high').length,
    mediumRiskCount: studentsData.filter(s => s.riskLevel === 'medium').length,
    lowRiskCount: studentsData.filter(s => s.riskLevel === 'low').length,
  };

  // Wellness score distribution for pie chart
  const wellnessDistribution = {
    excellent: studentsData.filter(s => s.overallScore >= 80).length,
    good: studentsData.filter(s => s.overallScore >= 60 && s.overallScore < 80).length,
    fair: studentsData.filter(s => s.overallScore >= 40 && s.overallScore < 60).length,
    poor: studentsData.filter(s => s.overallScore < 40).length,
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 75) return <Smile className="w-5 h-5 text-green-600" />;
    if (score >= 40) return <Meh className="w-5 h-5 text-yellow-600" />;
    return <Frown className="w-5 h-5 text-red-600" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Wellness</p>
                <p className={`text-3xl font-bold ${getScoreColor(stats.avgWellness)}`}>
                  {stats.avgWellness}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-3xl font-bold text-red-600">{stats.criticalCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-3xl font-bold text-orange-600">{stats.highRiskCount}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Healthy</p>
                <p className="text-3xl font-bold text-green-600">{stats.lowRiskCount}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Section */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Wellness Score Distribution
          </CardTitle>
          <CardDescription>
            Visual breakdown of student mental wellness across your cohort
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Simple Pie Chart Visualization */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Score Categories</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* Manual Pie Chart using conic-gradient */}
                  <div 
                    className="w-full h-full rounded-full"
                    style={{
                      background: `conic-gradient(
                        from 0deg,
                        #22c55e 0deg ${(wellnessDistribution.excellent / stats.totalStudents) * 360}deg,
                        #3b82f6 ${(wellnessDistribution.excellent / stats.totalStudents) * 360}deg ${((wellnessDistribution.excellent + wellnessDistribution.good) / stats.totalStudents) * 360}deg,
                        #eab308 ${((wellnessDistribution.excellent + wellnessDistribution.good) / stats.totalStudents) * 360}deg ${((wellnessDistribution.excellent + wellnessDistribution.good + wellnessDistribution.fair) / stats.totalStudents) * 360}deg,
                        #ef4444 ${((wellnessDistribution.excellent + wellnessDistribution.good + wellnessDistribution.fair) / stats.totalStudents) * 360}deg 360deg
                      )`
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-inner">
                        <Users className="w-8 h-8 text-gray-600 mb-1" />
                        <span className="text-2xl font-bold text-gray-900">{stats.totalStudents}</span>
                        <span className="text-xs text-gray-600">Students</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <div>
                    <p className="text-sm font-medium">Excellent (80-100)</p>
                    <p className="text-xs text-gray-600">{wellnessDistribution.excellent} students</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500"></div>
                  <div>
                    <p className="text-sm font-medium">Good (60-79)</p>
                    <p className="text-xs text-gray-600">{wellnessDistribution.good} students</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-500"></div>
                  <div>
                    <p className="text-sm font-medium">Fair (40-59)</p>
                    <p className="text-xs text-gray-600">{wellnessDistribution.fair} students</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <div>
                    <p className="text-sm font-medium">Poor (&lt;40)</p>
                    <p className="text-xs text-gray-600">{wellnessDistribution.poor} students</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Level Bars */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Risk Level Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-red-700">Critical Risk</span>
                    <span className="text-gray-600">{stats.criticalCount} students</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.criticalCount / stats.totalStudents) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-orange-700">High Risk</span>
                    <span className="text-gray-600">{stats.highRiskCount} students</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.highRiskCount / stats.totalStudents) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-yellow-700">Medium Risk</span>
                    <span className="text-gray-600">{stats.mediumRiskCount} students</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.mediumRiskCount / stats.totalStudents) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-green-700">Low Risk</span>
                    <span className="text-gray-600">{stats.lowRiskCount} students</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.lowRiskCount / stats.totalStudents) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Key Insights */}
              <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Key Insights
                </h4>
                <ul className="space-y-1 text-sm text-purple-800">
                  <li>• {stats.criticalCount + stats.highRiskCount} students need immediate attention</li>
                  <li>• Average wellness improved by 5% this week</li>
                  <li>• {stats.lowRiskCount} students maintaining healthy scores</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Details Table */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600" />
            Individual Student Wellness Scores
          </CardTitle>
          <CardDescription>
            Detailed breakdown of wellness metrics for each student
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {studentsData
              .sort((a, b) => a.overallScore - b.overallScore)
              .map((student) => (
              <div 
                key={student.studentId}
                className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getScoreIcon(student.overallScore)}
                    <div>
                      <h4 className="font-semibold text-gray-900">{student.studentName}</h4>
                      <p className="text-xs text-gray-600">Last updated: {student.lastUpdated}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge className={getRiskColor(student.riskLevel)}>
                      {student.riskLevel.toUpperCase()}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Overall Score</p>
                      <p className={`text-2xl font-bold ${getScoreColor(student.overallScore)}`}>
                        {student.overallScore}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metric Breakdown */}
                <div className="mt-4 grid grid-cols-4 gap-3">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600">Mood</p>
                    <p className="text-lg font-bold text-blue-600">{student.moodScore.toFixed(1)}</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-600">PHQ-9</p>
                    <p className="text-lg font-bold text-purple-600">{student.phq9Score}</p>
                  </div>
                  <div className="text-center p-2 bg-pink-50 rounded-lg">
                    <p className="text-xs text-gray-600">GAD-7</p>
                    <p className="text-lg font-bold text-pink-600">{student.gad7Score}</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600">AI Chat</p>
                    <p className="text-lg font-bold text-green-600">{student.chatbotScore}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentWellnessInsights;
