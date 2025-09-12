import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  BookOpen, 
  Users, 
  Brain,
  Smile,
  Meh,
  Frown,
  TrendingUp,
  Bell,
  LogOut
} from "lucide-react";
import MoodTracker from "./MoodTracker";
import ChatBot from "./ChatBot";
import AppointmentBooking from "./AppointmentBooking";
import ResourceHub from "./ResourceHub";
import PeerForum from "./PeerForum";

interface StudentDashboardProps {
  onLogout: () => void;
}

const StudentDashboard = ({ onLogout }: StudentDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mood' | 'chat' | 'appointments' | 'resources' | 'forum'>('dashboard');
  const [wellnessScore, setWellnessScore] = useState(75);

  const quickActions = [
    {
      title: "Daily Mood Check",
      description: "Track how you're feeling today",
      icon: Heart,
      color: "from-wellness to-wellness-light",
      action: () => setActiveTab('mood')
    },
    {
      title: "AI Support Chat",
      description: "Get instant mental health support",
      icon: MessageCircle,
      color: "from-primary to-support",
      action: () => setActiveTab('chat')
    },
    {
      title: "Book Counsellor",
      description: "Schedule a professional session",
      icon: Calendar,
      color: "from-support to-primary",
      action: () => setActiveTab('appointments')
    },
    {
      title: "Wellness Resources",
      description: "Access guides, videos & tools",
      icon: BookOpen,
      color: "from-secondary to-accent",
      action: () => setActiveTab('resources')
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'mood':
        return <MoodTracker onScoreUpdate={setWellnessScore} />;
      case 'chat':
        return <ChatBot />;
      case 'appointments':
        return <AppointmentBooking />;
      case 'resources':
        return <ResourceHub />;
      case 'forum':
        return <PeerForum />;
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Header */}
            <Card className="bg-gradient-to-r from-primary/10 via-wellness/10 to-support/10 border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-foreground">
                      Welcome back, Student! 👋
                    </CardTitle>
                    <CardDescription className="text-lg mt-2">
                      How are you feeling today? Let's check in on your wellness journey.
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Wellness Score</div>
                    <div className="text-3xl font-bold text-primary">{wellnessScore}%</div>
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={wellnessScore} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {wellnessScore >= 80 ? "Great job maintaining your mental health!" :
                     wellnessScore >= 60 ? "You're doing well, keep it up!" :
                     "Let's work together to improve your wellness."}
                  </p>
                </div>
              </CardHeader>
            </Card>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Card 
                  key={index}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-r overflow-hidden"
                  onClick={action.action}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  <CardHeader className="relative">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} shadow-lg group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {action.title}
                        </CardTitle>
                        <CardDescription>{action.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Recent Activity & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-wellness" />
                    Weekly Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-wellness-light rounded-lg">
                    <div className="flex items-center">
                      <Smile className="w-5 h-5 text-wellness mr-2" />
                      <span className="text-sm">Good days this week</span>
                    </div>
                    <span className="font-semibold text-wellness">5/7</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-support-light rounded-lg">
                    <div className="flex items-center">
                      <Brain className="w-5 h-5 text-support mr-2" />
                      <span className="text-sm">Meditation sessions</span>
                    </div>
                    <span className="font-semibold text-support">12 min</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center">
                      <MessageCircle className="w-5 h-5 text-primary mr-2" />
                      <span className="text-sm">AI chat sessions</span>
                    </div>
                    <span className="font-semibold text-primary">3</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-support" />
                    Upcoming & Reminders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                    <p className="font-medium text-primary">Counselling Session</p>
                    <p className="text-sm text-muted-foreground">Tomorrow at 2:00 PM</p>
                  </div>
                  <div className="p-3 border-l-4 border-wellness bg-wellness/5 rounded-r-lg">
                    <p className="font-medium text-wellness">Daily Mood Check</p>
                    <p className="text-sm text-muted-foreground">Complete your evening reflection</p>
                  </div>
                  <div className="p-3 border-l-4 border-support bg-support/5 rounded-r-lg">
                    <p className="font-medium text-support">Peer Group Chat</p>
                    <p className="text-sm text-muted-foreground">Join the study stress discussion</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-wellness-light/20 to-support-light/20">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <Heart className="w-8 h-8 text-primary mr-2" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-wellness bg-clip-text text-transparent">
                  MANN MITRA
                </span>
              </div>
              <div className="hidden md:flex space-x-4">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: Heart },
                  { id: 'mood', label: 'Mood', icon: Smile },
                  { id: 'chat', label: 'AI Chat', icon: MessageCircle },
                  { id: 'appointments', label: 'Appointments', icon: Calendar },
                  { id: 'resources', label: 'Resources', icon: BookOpen },
                  { id: 'forum', label: 'Community', icon: Users }
                ].map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center space-x-2 ${
                      activeTab === item.id 
                        ? 'bg-primary text-white' 
                        : 'hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                ))}
              </div>
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
        {renderContent()}
      </main>
    </div>
  );
};

export default StudentDashboard;