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
  ClipboardCheck
} from "lucide-react";
import mannMitraLogo from "@/assets/mann-mitra-logo.png";
import MoodTracker from "./MoodTracker";
import ChatBot from "./ChatBot";
import AppointmentBooking from "./AppointmentBooking";
import ResourceHub from "./ResourceHub";
import PeerForum from "./PeerForum";

interface StudentDashboardProps {
  onLogout: () => void;
}

const StudentDashboard = ({ onLogout }: StudentDashboardProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mood' | 'chat' | 'appointments' | 'resources' | 'forum'>('dashboard');
  const [wellnessScore, setWellnessScore] = useState(15);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

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
              studentId: 'current-student', // In real app, this would come from auth context
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
              studentId: 'current-student',
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
  const handleTabChange = (tab: 'dashboard' | 'mood' | 'chat' | 'appointments' | 'resources' | 'forum') => {
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
        description: "You have been safely logged out. Thank you for using Mann Mitra!",
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
      description: "Complete mental health survey",
      icon: ClipboardCheck,
      color: "from-purple-500 to-pink-500",
      action: () => window.location.href = '/phq9-survey?studentId=current-student'
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
                      How are you feeling today? Let&apos;s check in on your wellness journey.
                    </CardDescription>
                    {userLocation && (
                      <div className="mt-2 flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-1 text-green-600" />
                        <span>Current location: {userLocation.address || `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`}</span>
                      </div>
                    )}
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
                     wellnessScore >= 60 ? "You&apos;re doing well, keep it up!" :
                     "Let&apos;s work together to improve your wellness."}
                  </p>
                </div>
              </CardHeader>
            </Card>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Card 
                  key={index}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-r overflow-hidden"
                  onClick={action.action}
                >
                <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-5 group-hover:opacity-5 transition-opacity z-[-5]`} />
                  <CardHeader className="relative p-4 sm:p-6">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-r ${action.color} shadow-lg group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="group-hover:text-primary transition-colors text-sm sm:text-base">
                          {action.title}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">{action.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Recent Activity & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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
              
              {/* Safety & Location Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
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
    <div className="min-h-screen bg-gradient-to-br from-background via-wellness-light/20 to-support-light/20">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="relative w-8 h-8 mr-3">
                  <Image 
                    src={mannMitraLogo} 
                    alt="MANN MITRA"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-wellness bg-clip-text text-transparent">
                  MANN MITRA
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
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
                  onClick={() => handleTabChange(item.id as 'dashboard' | 'mood' | 'chat' | 'appointments' | 'resources' | 'forum')}
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

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center space-x-3">
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
                className="flex items-center space-x-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 9d97c67 (feat: add ChatBotMobile component for enhanced user interaction and mental health support)
      <main className={`max-w-7xl mx-auto ${
        activeTab === 'chat' 
          ? 'h-[calc(100vh-64px-76px)] flex flex-col p-0 w-full max-w-full md:px-4 md:py-8 md:pb-8 md:h-auto md:max-w-7xl' 
          : 'px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 md:pb-8'
      }`}>
<<<<<<< HEAD
=======
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 md:pb-8">
>>>>>>> 33ab2b9 (add bottom navbar)
=======
>>>>>>> 9d97c67 (feat: add ChatBotMobile component for enhanced user interaction and mental health support)
        {renderContent()}
      </main>

      {/* WhatsApp-Style Bottom Navigation Bar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {[
            { id: 'dashboard', label: 'Home', icon: Heart },
            { id: 'mood', label: 'Mood', icon: Smile },
            { id: 'chat', label: 'Chat', icon: MessageCircle },
            { id: 'appointments', label: 'Book', icon: Calendar },
            { id: 'resources', label: 'Learn', icon: BookOpen },
            { id: 'forum', label: 'Community', icon: Users }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id as 'dashboard' | 'mood' | 'chat' | 'appointments' | 'resources' | 'forum')}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                  ? 'text-primary' 
                  : 'text-gray-500 hover:text-primary'
              }`}
            >
              <item.icon 
                className={`w-6 h-6 mb-1 transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'fill-primary stroke-primary scale-110' 
                    : 'stroke-current'
                }`} 
              />
              <span className={`text-xs font-medium ${
                activeTab === item.id ? 'text-primary' : 'text-gray-600'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Location Permission Prompt Modal */}
      {showLocationPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <MapPin className="w-6 h-6 mr-3 text-primary" />
                Enable Location Access
              </CardTitle>
              <CardDescription>
                Help us provide better safety and emergency support by sharing your location.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Why we need your location:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Emergency Response:</strong> Quick help in crisis situations</li>
                  <li>• <strong>Nearby Resources:</strong> Find mental health services near you</li>
                  <li>• <strong>Safety Features:</strong> Enhanced support when needed</li>
                  <li>• <strong>Campus Security:</strong> Better student safety monitoring</li>
                </ul>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center text-green-800">
                  <Heart className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Your privacy is protected</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Location data is only used for safety and support purposes. You can disable this anytime.
                </p>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button 
                  onClick={requestLocationAccess}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Allow Location
                </Button>
                <Button 
                  variant="outline" 
                  onClick={dismissLocationPrompt}
                  className="flex-1"
                >
                  Maybe Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;