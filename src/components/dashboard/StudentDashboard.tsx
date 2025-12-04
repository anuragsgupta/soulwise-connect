"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  BookOpen, 
  Users, 
  Brain,
  Smile,
  TrendingUp,
  Bell,
  LogOut,
  MapPin,
  Navigation,
  AlertTriangle,
  Phone,
  ClipboardCheck,
  UserCircle,
  NotebookPen,
  CheckSquare,
  Settings,
  HelpCircle,
  User,
  Plus,
  X
} from "lucide-react";
import mannMitraLogo from "@/assets/mann-mitra-logo.png";
import MoodTracker from "./MoodTracker";
import ChatBot from "./ChatBot";
import AppointmentBooking from "./AppointmentBooking";
import ResourceHub from "./ResourceHub";
import PeerForum from "./PeerForum";
import AnonymousMentorChat from "./AnonymousMentorChat";
import Diary from "./Diary";
import TodoList from "./TodoList";
import CalendarView from "./CalendarView";
import NotificationBell from "@/components/notifications/NotificationBell";
import NotificationsPage from "@/components/notifications/NotificationsPage";
import BookSession from "@/components/sessions/BookSession";
import WellnessScoreWidget from "./WellnessScoreWidget";
import { useAuth } from "@/contexts/AuthContext";

interface StudentDashboardProps {
  onLogout: () => void;
}

type DashboardTab = 'dashboard' | 'mood' | 'chat' | 'mentor' | 'diary' | 'tasks' | 'calendar' | 'appointments' | 'notifications' | 'resources' | 'forum' | 'profile' | 'more';

const StudentDashboard = ({ onLogout }: StudentDashboardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [wellnessScore, setWellnessScore] = useState(15);
  const [hasTodayMoodCheckIn, setHasTodayMoodCheckIn] = useState<boolean | null>(null);
  const currentSemester = (user as { currentSemester?: string } | null)?.currentSemester;
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // Check if today's mood check-in is completed
  useEffect(() => {
    const checkTodayMoodCheckIn = async () => {
      if (!user?.id || user.userType !== 'STUDENT') return;

      try {
        const response = await fetch(`/api/mood-checkin/enhanced?studentId=${user.id}&days=1`);
        const data = await response.json();

        if (data.success && data.data) {
          const hasCheckedIn = !!data.data.todayCheckIn;
          setHasTodayMoodCheckIn(hasCheckedIn);
          
          // Directly redirect to mood check-in if not completed
          if (!hasCheckedIn) {
            setTimeout(() => {
              setActiveTab('mood');
            }, 500);
          }
        }
      } catch (error) {
        console.error('Error checking mood check-in:', error);
        setHasTodayMoodCheckIn(true); // Don't block access on error
      }
    };

    checkTodayMoodCheckIn();
  }, [user]);

  // Location access on component mount (student login)
  useEffect(() => {
    const initializeLocation = async () => {
      await checkLocationPermission();
      
      // Show location prompt after brief delay to allow UI to settle
      setTimeout(() => {
        if (locationPermission !== 'granted' && locationPermission !== 'denied') {
          setShowLocationPrompt(true);
        }
      }, 2000);
    };

    initializeLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-request location when permission is granted
  useEffect(() => {
    if (locationPermission === 'granted' && !userLocation) {
      getCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationPermission]);

  useEffect(() => {
    const handleDashboardNavigation = (event: Event) => {
      const { detail } = event as CustomEvent<{ tab?: DashboardTab; source?: string }>;
      const targetTab = detail?.tab;

      if (!targetTab) return;

      const allowedTabs: DashboardTab[] = ['dashboard', 'mood', 'chat', 'mentor', 'diary', 'appointments', 'notifications', 'resources', 'forum', 'more', 'profile'];
      if (allowedTabs.includes(targetTab)) {
        setActiveTab(targetTab);

        if (detail?.source === 'chatbot') {
          toast({
            title:
              targetTab === 'resources'
                ? 'Resource hub ready'
                : targetTab === 'appointments'
                ? 'Counselor booking ready'
                : 'Switching views',
            description:
              targetTab === 'resources'
                ? 'Surfacing calming tools recommended by Mann Mitra.'
                : targetTab === 'appointments'
                ? 'Opening counselor booking as recommended by Mann Mitra.'
                : 'Showing the requested dashboard area.',
            duration: 3000,
          });
        }
      }
    };

    window.addEventListener('dashboard:navigate', handleDashboardNavigation as EventListener);
    return () => window.removeEventListener('dashboard:navigate', handleDashboardNavigation as EventListener);
  }, [toast]);

  // Check and request location permission
  const checkLocationPermission = async () => {
    if ('geolocation' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(permission.state);
        
        permission.addEventListener('change', () => {
          setLocationPermission(permission.state);
        });

        // If permission already granted, get location immediately
        if (permission.state === 'granted') {
          getCurrentLocation();
        }
      } catch {
        console.log('Permission API not supported, will request directly');
        setLocationPermission('prompt');
      }
    } else {
      setLocationPermission('denied');
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Get user's current location
  const getCurrentLocation = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const timestamp = Date.now();
          
          try {
            // Reverse geocoding to get address
            const address = await reverseGeocode(latitude, longitude);
            
            const locationData = {
              latitude,
              longitude,
              address,
              timestamp
            };
            
            setUserLocation(locationData);
            setLocationPermission('granted');
            setShowLocationPrompt(false);
            
            // Log location for student safety and emergency purposes
            console.log('Student Location Logged:', {
              studentId: user?.id || 'unknown',
              name: user?.name || 'Unknown Student',
              location: locationData,
              loginTime: new Date().toISOString()
            });
            
            toast({
              title: "📍 Location Access Granted",
              description: `Current location: ${address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}`,
              duration: 5000,
            });
            
            resolve();
          } catch (error) {
            console.error('Geocoding error:', error);
            const locationData = {
              latitude,
              longitude,
              timestamp
            };
            setUserLocation(locationData);
            
            // Still log even without address
            console.log('Student Location Logged:', {
              studentId: user?.id || 'unknown',
              name: user?.name || 'Unknown Student',
              location: locationData,
              loginTime: new Date().toISOString()
            });
            
            resolve();
          }
        },
        (error) => {
          console.error('Location error:', error);
          setLocationPermission('denied');
          setShowLocationPrompt(false);
          
          let errorMessage = "Unable to get your location.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Some safety features may be limited.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          
          toast({
            title: "Location Access",
            description: errorMessage,
            variant: locationPermission === 'denied' ? "destructive" : "default",
            duration: 5000,
          });
          
          reject(error);
        },
        options
      );
    });
  };

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Mann-Mitra-Mental-Health-App'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.display_name) {
          // Format the address nicely
          const parts = data.display_name.split(', ');
          return parts.slice(0, 3).join(', '); // Get first 3 parts for a concise address
        }
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
    
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  // Handle location permission request
  const requestLocationAccess = async () => {
    setShowLocationPrompt(false);
    try {
      await getCurrentLocation();
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  // Dismiss location prompt
  const dismissLocationPrompt = () => {
    setShowLocationPrompt(false);
    toast({
      title: "Location Access Skipped",
      description: "You can enable location access later in settings for enhanced safety features.",
      duration: 5000,
    });
  };

  // Handle tab change
  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
  };

  // Enhanced logout function with proper cleanup
  const handleLogout = () => {
    try {
      // Clear any stored user data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('studentSession');
      
      // Show confirmation toast
      toast({
        title: "Logged Out Successfully",
        description: `Goodbye ${user?.name || 'Student'}! You have been safely logged out. Thank you for using Mann Mitra!`,
        duration: 3000,
      });
      
      // Call the parent logout function
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: "There was an issue logging out. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const quickActions = [
    {
      title: "Daily Mood Check",
      description: "Track how you're feeling today",
      icon: Heart,
      color: "from-wellness to-wellness-light",
      action: () => setActiveTab('mood')
    },
    {
      title: "PHQ-9 Assessment",
      description: "Depression screening survey",
      icon: ClipboardCheck,
      color: "from-purple-500 to-pink-500",
      action: () => window.location.href = `/phq9-survey?studentId=${user?.id || 'unknown'}`
    },
    {
      title: "GAD-7 Assessment",
      description: "Anxiety screening survey",
      icon: Brain,
      color: "from-green-500 to-blue-500",
      action: () => window.location.href = `/gad7-survey?studentId=${user?.id || 'unknown'}`
    },
    {
      title: "AI Support Chat",
      description: "Get instant mental health support",
      icon: MessageCircle,
      color: "from-primary to-support",
      action: () => setActiveTab('chat')
    },
    {
      title: "Book Appointment",
      description: "Schedule session with faculty/counsellor",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
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
      case 'mentor':
        return <AnonymousMentorChat />;
      case 'diary':
        return <Diary />;
      case 'tasks':
        return <TodoList />;
      case 'calendar':
        return <CalendarView />;
      case 'appointments':
        return <BookSession />;
      case 'notifications':
        return <NotificationsPage />;
      case 'resources':
        return <ResourceHub />;
      case 'forum':
        return <PeerForum />;
      case 'profile':
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 border-0 shadow-xl rounded-2xl">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user?.name || 'Student'}</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">{user?.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Wellness Score</span>
                    <Badge variant="secondary">{wellnessScore}/100</Badge>
                  </div>
                  {currentSemester && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current Semester</span>
                      <Badge variant="outline">{currentSemester}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Settings and Help Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-2xl border-gray-100">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                      <Settings className="w-7 h-7 text-gray-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">Settings</CardTitle>
                      <CardDescription className="text-gray-500">Preferences & notifications</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
              
              <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-2xl border-gray-100">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
                      <HelpCircle className="w-7 h-7 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">Help & Support</CardTitle>
                      <CardDescription className="text-gray-500">FAQs and contact support</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
            
            {/* Logout Button */}
            <Card className="rounded-2xl border-gray-100">
              <CardContent className="pt-6">
                <Button
                  variant="destructive"
                  className="w-full h-12 text-base rounded-xl shadow-md hover:shadow-lg transition-all"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Header */}
            <Card className="relative bg-white/80 border border-gray-200/50 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/8 to-pink-500/8" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />
              <CardHeader className="pb-6 relative">
                <CardTitle className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-3 duration-700">
                  Welcome back, {user?.name || 'Student'}! 👋
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Wellness Score Widget */}
            {user?.id && (
              <WellnessScoreWidget studentId={user.id} showBreakdown={true} />
            )}

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Card 
                  key={index}
                  className="group cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-gray-200/60 rounded-3xl overflow-hidden bg-white/90 backdrop-blur-sm hover:border-transparent"
                  onClick={action.action}
                >
                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-8 transition-opacity duration-500`} />
                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                  <CardHeader className="relative p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${action.color} shadow-lg group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl transition-all duration-500`}>
                        <action.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base md:text-lg font-bold text-gray-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                          {action.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-500 mt-2 group-hover:text-gray-600 transition-colors">{action.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Recent Activity & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              <Card className="rounded-3xl border border-gray-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 mr-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    Weekly Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/60 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center">
                      <div className="p-2 rounded-xl bg-green-100 mr-3 group-hover:scale-110 transition-transform">
                        <Smile className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Good days this week</span>
                    </div>
                    <span className="font-extrabold text-green-600 text-xl group-hover:scale-110 transition-transform">5/7</span>
                  </div>
                  <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-200/60 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center">
                      <div className="p-2 rounded-xl bg-purple-100 mr-3 group-hover:scale-110 transition-transform">
                        <Brain className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Meditation sessions</span>
                    </div>
                    <span className="font-extrabold text-purple-600 text-xl group-hover:scale-110 transition-transform">12 min</span>
                  </div>
                  <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200/60 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center">
                      <div className="p-2 rounded-xl bg-blue-100 mr-3 group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">AI chat sessions</span>
                    </div>
                    <span className="font-extrabold text-blue-600 text-xl group-hover:scale-110 transition-transform">3</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-gray-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 mr-3">
                      <Bell className="w-5 h-5 text-orange-600" />
                    </div>
                    Upcoming & Reminders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="group p-4 border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-transparent rounded-r-2xl hover:from-blue-100 hover:shadow-md transition-all duration-300 cursor-pointer">
                    <p className="font-bold text-blue-700 flex items-center">📅 Counselling Session</p>
                    <p className="text-sm text-gray-600 mt-1.5 font-medium">Tomorrow at 2:00 PM</p>
                  </div>
                  <div className="group p-4 border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-transparent rounded-r-2xl hover:from-green-100 hover:shadow-md transition-all duration-300 cursor-pointer">
                    <p className="font-bold text-green-700 flex items-center">💚 Daily Mood Check</p>
                    <p className="text-sm text-gray-600 mt-1.5 font-medium">Complete your evening reflection</p>
                  </div>
                  <div className="group p-4 border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-transparent rounded-r-2xl hover:from-purple-100 hover:shadow-md transition-all duration-300 cursor-pointer">
                    <p className="font-bold text-purple-700 flex items-center">👥 Peer Group Chat</p>
                    <p className="text-sm text-gray-600 mt-1.5 font-medium">Join the study stress discussion</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Safety & Location Status Card */}
              <Card className="rounded-3xl border border-gray-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 mr-3">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    Safety Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {userLocation ? (
                    <>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm font-medium text-green-800">Location Active</span>
                          </div>
                          <Badge className="bg-green-100 text-green-800 text-xs">Protected</Badge>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          Emergency services can locate you quickly if needed
                        </p>
                      </div>
                      
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-blue-800">Campus Safety Connected</span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          Your location is monitored for enhanced student safety
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                            <span className="text-sm font-medium text-yellow-800">Location Not Shared</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={requestLocationAccess}
                            className="text-xs"
                          >
                            Enable
                          </Button>
                        </div>
                        <p className="text-xs text-yellow-600 mt-1">
                          Enable location for enhanced safety features
                        </p>
                      </div>
                    </>
                  )}
                  
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-red-600 mr-2" />
                      <span className="text-sm font-medium text-red-800">24/7 Crisis Support</span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      📞 1800-599-0019 - KIRAN Mental Health Helpline
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/40 via-purple-50/30 to-pink-50/40 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.03),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-300/10 to-pink-300/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-300/10 to-cyan-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-2xl border-b border-gray-200/60 shadow-xl sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex items-center group">
                <div className="relative w-10 h-10 mr-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                  <Image 
                    src={mannMitraLogo} 
                    alt="MANN MITRA"
                    fill
                    className="object-contain drop-shadow-lg"
                  />
                </div>
                <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                  MANN MITRA
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Heart },
                { id: 'mood', label: 'Mood', icon: Smile },
                { id: 'chat', label: 'Chat', icon: MessageCircle },
                { id: 'appointments', label: 'Appointments', icon: Calendar },
                { id: 'resources', label: 'Resources', icon: BookOpen },
                { id: 'forum', label: 'Community', icon: Users }
              ].map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleTabChange(item.id as DashboardTab)}
                  className={`flex items-center space-x-2 rounded-xl transition-all duration-300 font-semibold ${
                    activeTab === item.id 
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg scale-105' 
                      : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 hover:scale-105'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              ))}
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Notification Bell */}
              <NotificationBell />
              
              {/* Location Status Indicator */}
              <div className="flex items-center space-x-2">
                {userLocation ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    Located
                  </Badge>
                ) : locationPermission === 'denied' ? (
                  <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    No Location
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                    <Navigation className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-2 border-red-200 text-red-600 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white hover:border-transparent transition-all duration-300 rounded-xl font-semibold shadow-sm hover:shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile Notification Bell */}
              <NotificationBell />
              
              {/* Mobile Location Indicator */}
              <div className="flex items-center">
                {userLocation ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    <MapPin className="w-3 h-3" />
                  </Badge>
                ) : locationPermission === 'denied' ? (
                  <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                    <AlertTriangle className="w-3 h-3" />
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                    <Navigation className="w-3 h-3" />
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto ${
        activeTab === 'chat' || activeTab === 'mentor'
          ? 'h-[calc(100vh-64px-76px)] flex flex-col p-0 w-full max-w-full md:px-4 md:py-8 md:pb-8 md:h-auto md:max-w-7xl' 
          : 'px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 md:pb-8'
      }`}>
        {renderContent()}
      </main>

      {/* WhatsApp-Style Bottom Navigation Bar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-50 md:hidden safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {[
            { id: 'dashboard', label: 'Home', icon: Heart },
            { id: 'mood', label: 'Mood', icon: Smile },
            { id: 'chat', label: 'Chat', icon: MessageCircle },
            { id: 'forum', label: 'Community', icon: Users },
            { id: 'profile', label: 'Profile', icon: User }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id as DashboardTab)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-300 relative ${
                activeTab === item.id 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              {/* Active indicator */}
              {activeTab === item.id && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full" />
              )}
              <item.icon 
                className={`w-6 h-6 mb-1 transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'fill-blue-600 stroke-blue-600 scale-110' 
                    : 'stroke-current'
                }`} 
              />
              <span className={`text-xs font-semibold transition-all duration-300 ${
                activeTab === item.id ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Location Permission Prompt Modal */}
      {showLocationPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md rounded-3xl border-0 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 bg-white/95 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl font-bold">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 mr-3 animate-pulse" style={{ animationDuration: '2s' }}>
                  <MapPin className="w-7 h-7 text-blue-600" />
                </div>
                Enable Location Access
              </CardTitle>
              <CardDescription className="text-base text-gray-600 mt-2 font-medium">
                Help us provide better safety and emergency support by sharing your location.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
                  Why we need your location:
                </h4>
                <ul className="text-sm text-blue-700 space-y-2 font-medium">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">🚨</span>
                    <span><strong>Emergency Response:</strong> Quick help in crisis situations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">📍</span>
                    <span><strong>Nearby Resources:</strong> Find mental health services near you</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">🛡️</span>
                    <span><strong>Safety Features:</strong> Enhanced support when needed</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">🏫</span>
                    <span><strong>Campus Security:</strong> Better student safety monitoring</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center text-green-800 mb-2">
                  <div className="p-1.5 rounded-lg bg-green-100 mr-2">
                    <Heart className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-bold">Your privacy is protected</span>
                </div>
                <p className="text-xs text-green-700 font-medium leading-relaxed">
                  Location data is only used for safety and support purposes. You can disable this anytime in settings.
                </p>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button 
                  onClick={requestLocationAccess}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  Allow Location
                </Button>
                <Button 
                  variant="outline" 
                  onClick={dismissLocationPrompt}
                  className="flex-1 h-12 rounded-xl font-semibold border-gray-300 hover:bg-gray-100 transition-all duration-300"
                >
                  Maybe Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Action Button (FAB) - Mobile & Desktop */}
      {/* Hidden on chat/mentor tabs to avoid conflict with send button */}
      {activeTab !== 'chat' && activeTab !== 'mentor' && (
        <div className="fixed bottom-28 right-4 z-40 md:bottom-8 md:right-8">
          {/* FAB Menu Items */}
          {isFabOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
              onClick={() => setIsFabOpen(false)}
            />
            
            {/* Menu Items */}
            <div className="absolute bottom-16 right-0 space-y-3 mb-2">
              {[
                { id: 'mentor', label: 'Mentor Chat', icon: UserCircle, color: 'bg-blue-500 hover:bg-blue-600' },
                { id: 'diary', label: 'My Diary', icon: NotebookPen, color: 'bg-purple-500 hover:bg-purple-600' },
                { id: 'tasks', label: 'My Tasks', icon: CheckSquare, color: 'bg-indigo-500 hover:bg-indigo-600' },
                { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'bg-pink-500 hover:bg-pink-600' },
                { id: 'forum', label: 'Peer Forum', icon: Users, color: 'bg-green-500 hover:bg-green-600' },
              ].map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-end space-x-3 animate-in slide-in-from-bottom-2 fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-xl text-sm font-semibold text-gray-700 border border-gray-200/60">
                    {item.label}
                  </span>
                  <button
                    onClick={() => {
                      handleTabChange(item.id as DashboardTab);
                      setIsFabOpen(false);
                    }}
                    className={`${item.color} w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:rotate-12 hover:shadow-2xl`}
                  >
                    <item.icon className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Main FAB Button */}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center text-white transition-all duration-500 hover:scale-110 relative overflow-hidden ${
            isFabOpen 
              ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-3xl rotate-45' 
              : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 hover:shadow-3xl'
          }`}
        >
          {/* Animated ring */}
          <div className={`absolute inset-0 rounded-2xl bg-white/30 ${
            isFabOpen ? 'animate-ping' : ''
          }`} style={{ animationDuration: '1.5s' }} />
          {isFabOpen ? (
            <X className="w-7 h-7 relative z-10" />
          ) : (
            <Plus className="w-7 h-7 relative z-10" />
          )}
        </button>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;