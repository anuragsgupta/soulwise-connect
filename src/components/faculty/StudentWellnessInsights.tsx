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
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
}

const StudentWellnessInsights = () => {
  const [studentsData, setStudentsData] = useState<WellnessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from API
  useEffect(() => {
    const fetchWellnessData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/faculty/wellness-insights');
        const data = await response.json();
        
        if (data.success && data.data.students) {
          setStudentsData(data.data.students);
        } else {
          setError(data.message || 'Failed to load wellness data');
        }
      } catch (err) {
        console.error('Error fetching wellness data:', err);
        setError('Failed to load wellness data');
      } finally {
        setLoading(false);
      }
    };

    fetchWellnessData();
  }, []);

  // Calculate aggregate statistics
  const stats = {
    totalStudents: studentsData.length,
    avgWellness: studentsData.length > 0 
      ? Math.round(studentsData.reduce((sum, s) => sum + s.overallScore, 0) / studentsData.length)
      : 0,
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading wellness insights...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (studentsData.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No student wellness data available yet</p>
          </div>
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
                  {stats.criticalCount + stats.highRiskCount > 0 && (
                    <li>• {stats.criticalCount + stats.highRiskCount} {stats.criticalCount + stats.highRiskCount === 1 ? 'student needs' : 'students need'} immediate attention</li>
                  )}
                  <li>• Average wellness score: {stats.avgWellness}%</li>
                  {stats.lowRiskCount > 0 && (
                    <li>• {stats.lowRiskCount} {stats.lowRiskCount === 1 ? 'student is' : 'students are'} maintaining healthy scores</li>
                  )}
                  {stats.totalStudents === 0 && (
                    <li>• No student data available yet</li>
                  )}
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
            Overall wellness scores for each student (sorted by priority)
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentWellnessInsights;
