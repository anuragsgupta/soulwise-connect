"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, Target, Heart } from "lucide-react";

interface MoodData {
  date: string;
  happy?: number;
  neutral?: number;
  sad?: number;
  moodScore?: number;
  moodLabel?: string;
}

interface TaskData {
  date: string;
  completed: number;
  pending: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface StatisticsChartsProps {
  moodData: MoodData[];
  taskData: TaskData[];
  categoryData: CategoryData[];
  priorityData: CategoryData[];
}

const MOOD_COLORS = {
  happy: '#10b981',
  neutral: '#6b7280',
  sad: '#ef4444'
};

const CATEGORY_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const StatisticsCharts = ({ moodData, taskData, categoryData, priorityData }: StatisticsChartsProps) => {
  // Check if we have the new mood score format (for mood tracker) or old format (for diary)
  const hasMoodScore = moodData.length > 0 && moodData[0].moodScore !== undefined;
  
  return (
    <div className="space-y-4">
      {/* Mood Trends Over Time */}
      {moodData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Heart className="w-5 h-5 mr-2 text-purple-600" />
              {hasMoodScore ? 'Recent Mood Check-ins' : 'Mood Trends (Last 7 Days)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {hasMoodScore ? (
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 7]} ticks={[1, 2, 3, 4, 5, 6, 7]} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                            <p className="font-semibold">{payload[0].payload.date}</p>
                            <p className="text-purple-600">
                              {payload[0].payload.moodLabel} ({payload[0].value}/7)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="moodScore" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    name="Mood Score"
                    dot={{ fill: '#8b5cf6', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              ) : (
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="happy" 
                    stroke={MOOD_COLORS.happy} 
                    strokeWidth={2}
                    name="Happy" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="neutral" 
                    stroke={MOOD_COLORS.neutral} 
                    strokeWidth={2}
                    name="Neutral" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sad" 
                    stroke={MOOD_COLORS.sad} 
                    strokeWidth={2}
                    name="Sad" 
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Task Completion Trends */}
      {taskData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Task Completion (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Task Categories Distribution */}
        {categoryData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Target className="w-5 h-5 mr-2 text-indigo-600" />
                Tasks by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Task Priority Distribution */}
        {priorityData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Activity className="w-5 h-5 mr-2 text-orange-600" />
                Tasks by Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={priorityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StatisticsCharts;
