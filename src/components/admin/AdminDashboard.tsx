import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  Heart,
  Brain,
  MessageCircle,
  CheckCircle,
  Clock,
  LogOut,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  // Mock data for demonstration
  const stats = {
    totalStudents: 1247,
    activeUsers: 892,
    totalSessions: 3456,
    averageWellness: 72,
    criticalAlerts: 8,
    appointmentsToday: 23
  };

  const weeklyData = [
    { day: 'Mon', logins: 145, moodScore: 68 },
    { day: 'Tue', logins: 167, moodScore: 72 },
    { day: 'Wed', logins: 189, moodScore: 74 },
    { day: 'Thu', logins: 203, moodScore: 69 },
    { day: 'Fri', logins: 176, moodScore: 71 },
    { day: 'Sat', logins: 98, moodScore: 76 },
    { day: 'Sun', logins: 87, moodScore: 78 }
  ];

  const commonIssues = [
    { issue: 'Exam Anxiety', count: 234, percentage: 35, trend: '+12%' },
    { issue: 'Academic Stress', count: 198, percentage: 30, trend: '+8%' },
    { issue: 'Sleep Issues', count: 156, percentage: 23, trend: '-3%' },
    { issue: 'Social Isolation', count: 123, percentage: 18, trend: '+15%' },
    { issue: 'Depression Symptoms', count: 89, percentage: 13, trend: '+5%' }
  ];

  const recentAlerts = [
    { id: 1, student: 'Student #1247', issue: 'High-risk depression indicators', time: '2 hours ago', severity: 'high' },
    { id: 2, student: 'Student #0892', issue: 'Repeated anxiety episodes', time: '4 hours ago', severity: 'medium' },
    { id: 3, student: 'Student #1156', issue: 'Sleep pattern disruption', time: '6 hours ago', severity: 'low' },
    { id: 4, student: 'Student #0734', issue: 'Social withdrawal pattern', time: '8 hours ago', severity: 'medium' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-support-light/10 to-wellness-light/10">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-primary mr-2" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-wellness bg-clip-text text-transparent">
                MANN MITRA Admin
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout}
              className="flex items-center space-x-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mental Health Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor student wellness trends and identify students who need support</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Total Students</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalStudents.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="mt-4">
                <Progress value={87} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">87% platform adoption</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-wellness/10 to-wellness/5 border-wellness/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-wellness">Active Users</p>
                  <p className="text-3xl font-bold text-wellness">{stats.activeUsers}</p>
                </div>
                <Activity className="w-8 h-8 text-wellness" />
              </div>
              <div className="mt-4">
                <Progress value={72} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">Daily active rate</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-support/10 to-support/5 border-support/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-support">Avg. Wellness</p>
                  <p className="text-3xl font-bold text-support">{stats.averageWellness}%</p>
                </div>
                <Heart className="w-8 h-8 text-support" />
              </div>
              <div className="mt-4">
                <Progress value={stats.averageWellness} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">Platform-wide average</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-destructive">Critical Alerts</p>
                  <p className="text-3xl font-bold text-destructive">{stats.criticalAlerts}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <div className="mt-4">
                <div className="flex items-center text-xs text-destructive">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +2 since yesterday
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                Weekly Activity Trends
              </CardTitle>
              <CardDescription>Daily logins and average mood scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyData.map((day, index) => (
                  <div key={day.day} className="flex items-center space-x-4">
                    <div className="w-12 text-sm font-medium">{day.day}</div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Logins: {day.logins}</span>
                        <span>Mood: {day.moodScore}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-wellness h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(day.logins / 250) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Common Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-support" />
                Most Common Issues
              </CardTitle>
              <CardDescription>What students are seeking help for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commonIssues.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{item.issue}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{item.count}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.trend.startsWith('+') 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {item.trend}
                          </span>
                        </div>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts & Today's Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Critical Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
                Recent Critical Alerts
              </CardTitle>
              <CardDescription>Students requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === 'high' 
                        ? 'border-l-red-500 bg-red-50' 
                        : alert.severity === 'medium'
                        ? 'border-l-orange-500 bg-orange-50'
                        : 'border-l-yellow-500 bg-yellow-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-sm">{alert.student}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{alert.issue}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          alert.severity === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : alert.severity === 'medium'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alert.severity}
                        </span>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {alert.time}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button size="sm" variant="outline" className="mr-2">
                        Contact Student
                      </Button>
                      <Button size="sm" variant="outline">
                        Assign Counselor
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-wellness" />
                Today's Appointments
              </CardTitle>
              <CardDescription>Counseling sessions scheduled for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-wellness">{stats.appointmentsToday}</div>
                <div className="text-sm text-muted-foreground">sessions scheduled</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-wellness-light rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-wellness mr-2" />
                    <span className="text-sm">Completed Sessions</span>
                  </div>
                  <span className="font-semibold text-wellness">8</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-primary mr-2" />
                    <span className="text-sm">Upcoming Sessions</span>
                  </div>
                  <span className="font-semibold text-primary">15</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 text-muted-foreground mr-2" />
                    <span className="text-sm">Follow-up Required</span>
                  </div>
                  <span className="font-semibold text-muted-foreground">3</span>
                </div>
              </div>

              <Button className="w-full mt-4 bg-gradient-to-r from-wellness to-primary hover:from-wellness/90 hover:to-primary/90">
                View Full Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;