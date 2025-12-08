"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle, 
  Heart,
  Activity,
  Brain,
  Smile,
  Frown,
  Meh,
  Download,
  RefreshCw
} from "lucide-react";

interface WellnessData {
  studentId: string;
  studentName: string;
  overallScore: number;
  moodScore: number;
  phq9Score: number;
  gad7Score: number;
  chatbotScore: number;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
}

interface StudentWellnessInsightsProps {
  facultyId: string;
}

const StudentWellnessInsights = ({ facultyId }: StudentWellnessInsightsProps) => {
  const [wellnessData, setWellnessData] = useState<WellnessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');

  useEffect(() => {
    fetchWellnessData();
  }, [facultyId, timeRange]);

  const fetchWellnessData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/faculty/wellness-insights?facultyId=${facultyId}&range=${timeRange}`);
      // const data = await response.json();
      
      // Mock data for now
      const mockData: WellnessData[] = [
        { studentId: '1', studentName: 'Aarav Sharma', overallScore: 45, moodScore: 50, phq9Score: 14, gad7Score: 12, chatbotScore: 38, lastUpdated: '2 hours ago', trend: 'down' },
        { studentId: '2', studentName: 'Priya Patel', overallScore: 78, moodScore: 80, phq9Score: 5, gad7Score: 4, chatbotScore: 75, lastUpdated: '1 day ago', trend: 'up' },
        { studentId: '3', studentName: 'Rahul Gupta', overallScore: 62, moodScore: 65, phq9Score: 8, gad7Score: 9, chatbotScore: 60, lastUpdated: '3 hours ago', trend: 'stable' },
        { studentId: '4', studentName: 'Sneha Reddy', overallScore: 85, moodScore: 88, phq9Score: 3, gad7Score: 2, chatbotScore: 82, lastUpdated: '5 hours ago', trend: 'up' },
        { studentId: '5', studentName: 'Arjun Singh', overallScore: 35, moodScore: 40, phq9Score: 18, gad7Score: 16, chatbotScore: 30, lastUpdated: '30 min ago', trend: 'down' },
        { studentId: '6', studentName: 'Kavya Nair', overallScore: 72, moodScore: 75, phq9Score: 6, gad7Score: 5, chatbotScore: 70, lastUpdated: '2 days ago', trend: 'stable' },
        { studentId: '7', studentName: 'Rohan Joshi', overallScore: 55, moodScore: 58, phq9Score: 11, gad7Score: 10, chatbotScore: 52, lastUpdated: '1 hour ago', trend: 'down' },
        { studentId: '8', studentName: 'Ananya Verma', overallScore: 90, moodScore: 92, phq9Score: 2, gad7Score: 1, chatbotScore: 88, lastUpdated: '4 hours ago', trend: 'up' },
      ];
      
      setWellnessData(mockData);
    } catch (error) {
      console.error('Error fetching wellness data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: wellnessData.length,
    critical: wellnessData.filter(d => d.overallScore < 40).length,
    needsAttention: wellnessData.filter(d => d.overallScore >= 40 && d.overallScore < 60).length,
    good: wellnessData.filter(d => d.overallScore >= 60 && d.overallScore < 75).length,
    excellent: wellnessData.filter(d => d.overallScore >= 75).length,
    averageScore: wellnessData.length > 0 ? Math.round(wellnessData.reduce((sum, d) => sum + d.overallScore, 0) / wellnessData.length) : 0,
    improving: wellnessData.filter(d => d.trend === 'up').length,
    declining: wellnessData.filter(d => d.trend === 'down').length,
  };

  // Pie chart data for wellness distribution
  const wellnessDistributionData = [
    { name: 'Critical (<40)', value: stats.critical, color: '#ef4444' },
    { name: 'Needs Attention (40-60)', value: stats.needsAttention, color: '#f59e0b' },
    { name: 'Good (60-75)', value: stats.good, color: '#3b82f6' },
    { name: 'Excellent (75+)', value: stats.excellent, color: '#10b981' },
  ].filter(item => item.value > 0);

  // Bar chart data for component breakdown
  const componentBreakdownData = wellnessData.slice(0, 8).map(student => ({
    name: student.studentName.split(' ')[0],
    Mood: student.moodScore,
    PHQ9: 100 - ((student.phq9Score / 27) * 100),
    GAD7: 100 - ((student.gad7Score / 21) * 100),
    Chatbot: student.chatbotScore,
  }));

  // Trend data
  const trendData = [
    { category: 'Improving', count: stats.improving, color: '#10b981' },
    { category: 'Stable', count: wellnessData.filter(d => d.trend === 'stable').length, color: '#3b82f6' },
    { category: 'Declining', count: stats.declining, color: '#ef4444' },
  ];

  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-red-600 bg-red-50';
    if (score < 60) return 'text-orange-600 bg-orange-50';
    if (score < 75) return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <Card className="border-purple-200">
        <CardContent className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Heart className="w-6 h-6 text-purple-600" />
                Student Wellness Insights
              </CardTitle>
              <CardDescription>
                Overview of your students' mental health and wellness scores
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 Days</SelectItem>
                  <SelectItem value="30days">30 Days</SelectItem>
                  <SelectItem value="90days">90 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchWellnessData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/80 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <Badge variant="outline">{stats.total}</Badge>
              </div>
              <div className="text-2xl font-bold text-purple-600">{stats.averageScore}</div>
              <div className="text-xs text-gray-600">Avg. Wellness Score</div>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <Badge variant="destructive">{stats.critical}</Badge>
              </div>
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
              <div className="text-xs text-gray-600">Need Immediate Care</div>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <Badge className="bg-green-100 text-green-800">{stats.improving}</Badge>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.improving}</div>
              <div className="text-xs text-gray-600">Improving</div>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <TrendingDown className="w-5 h-5 text-orange-600" />
                <Badge className="bg-orange-100 text-orange-800">{stats.declining}</Badge>
              </div>
              <div className="text-2xl font-bold text-orange-600">{stats.declining}</div>
              <div className="text-xs text-gray-600">Declining</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wellness Distribution Pie Chart */}
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Wellness Score Distribution
            </CardTitle>
            <CardDescription>Breakdown by wellness categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={wellnessDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {wellnessDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {wellnessDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Component Breakdown Bar Chart */}
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Wellness Components Breakdown
            </CardTitle>
            <CardDescription>Individual component scores per student</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={componentBreakdownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Mood" fill="#8b5cf6" />
                <Bar dataKey="PHQ9" fill="#3b82f6" />
                <Bar dataKey="GAD7" fill="#10b981" />
                <Bar dataKey="Chatbot" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Student List with Details */}
      <Card className="border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Individual Student Scores</CardTitle>
              <CardDescription>Detailed breakdown of each student's wellness metrics</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {wellnessData.map((student) => (
              <div 
                key={student.studentId}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg border-4 ${getScoreColor(student.overallScore)}`}>
                    {student.overallScore}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-800">{student.studentName}</h4>
                      {getTrendIcon(student.trend)}
                    </div>
                    <div className="flex gap-3 mt-1">
                      <div className="text-xs text-gray-600">
                        <Smile className="w-3 h-3 inline mr-1" />
                        Mood: {student.moodScore}
                      </div>
                      <div className="text-xs text-gray-600">
                        <Brain className="w-3 h-3 inline mr-1" />
                        PHQ-9: {student.phq9Score}/27
                      </div>
                      <div className="text-xs text-gray-600">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        GAD-7: {student.gad7Score}/21
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Updated {student.lastUpdated}</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentWellnessInsights;
