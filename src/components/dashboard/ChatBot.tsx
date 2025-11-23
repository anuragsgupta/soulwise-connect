"use client";

import { useState, useRef, useEffect, Suspense, lazy } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import ChatMessages, { Message } from "./ChatMessages";
import ChatInput from "./ChatInput";
import QuickActions from "./QuickActions";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Heart, 
  Brain,
  Phone,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Trash2,
  RefreshCw,
  MapPin,
  Navigation
} from "lucide-react";

// Lazy load Spline component
// const Spline = lazy(() => import('@splinetool/react-spline/next'));


const ChatBot = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>("");
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [locationToastShown, setLocationToastShown] = useState(false);
  const [crisisLevel, setCrisisLevel] = useState<'none' | 'low' | 'medium' | 'high' | 'critical'>('none');
  const [reducedMotion, setReducedMotion] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat storage and load existing messages
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // TODO: Replace with dynamic user ID from authentication
        // For now, using hardcoded user ID for testing
        const currentSessionId = 'user-1763748214213';
        console.log('👤 Using hardcoded user ID:', currentSessionId);
        
        setSessionId(currentSessionId);
        
        // Load existing messages from DynamoDB
        const response = await fetch(`/api/chat-memory?userId=${currentSessionId}&action=recent&limit=50`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.messages && data.messages.length > 0) {
            // Convert DynamoDB messages to UI Message format
            const loadedMessages: Message[] = data.messages.map((msg: any) => ({
              id: msg.timestamp,
              content: msg.message,
              sender: msg.role === 'user' ? 'user' : 'bot',
              timestamp: new Date(msg.created_at),
              type: msg.risk_level === 'severe' || msg.risk_level === 'mild' ? 'warning' : undefined,
            }));
            setMessages(loadedMessages);
            // Scroll to bottom after messages load
            setTimeout(() => scrollToBottom(), 300);
          } else {
            // Set initial welcome message if no saved messages
            const welcomeMessage: Message = {
              id: '1',
              content: "**Hello! I'm Mann Mitra, your AI mental health companion.** 🤗\n\nI'm here to:\n\n• **Listen** to your concerns\n• **Support** you through challenges  \n• **Guide** you toward helpful resources\n\n**How are you feeling today?** ✨",
              sender: 'bot',
              timestamp: new Date(),
            };
            setMessages([welcomeMessage]);
            
            // Save welcome message to DynamoDB
            await fetch('/api/chat-memory', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: currentSessionId,
                role: 'assistant',
                message: welcomeMessage.content,
              }),
            });
          }
        } else {
          throw new Error('Failed to load chat history');
        }
      } catch (error) {
        console.error('Failed to initialize chat storage:', error);
        // Fallback to default welcome message
        setMessages([{
          id: '1',
          content: "**Hello! I'm Mann Mitra, your AI mental health companion.** 🤗\n\nI'm here to:\n\n• **Listen** to your concerns\n• **Support** you through challenges  \n• **Guide** you toward helpful resources\n\n**How are you feeling today?** ✨",
          sender: 'bot',
          timestamp: new Date(),
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
    checkLocationPermission();
  }, []);

  // Check and request location permission
  const checkLocationPermission = async () => {
    if ('geolocation' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(permission.state);
        
        permission.addEventListener('change', () => {
          setLocationPermission(permission.state);
        });
      } catch (error) {
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
            
            // Only show toast if it hasn't been shown before
            if (!locationToastShown) {
              toast({
                title: "📍 Location Updated",
                description: `Current location: ${address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}`,
                duration: 5000,
              });
              setLocationToastShown(true);
            }
            
            resolve();
          } catch (error) {
            console.error('Geocoding error:', error);
            const locationData = {
              latitude,
              longitude,
              timestamp
            };
            setUserLocation(locationData);
            resolve();
          }
        },
        (error) => {
          console.error('Location error:', error);
          setLocationPermission('denied');
          
          let errorMessage = "Unable to get your location.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please enable location permissions.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          
          toast({
            title: "Location Error",
            description: errorMessage,
            variant: "destructive",
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

  // Share location in chat
  const shareLocationInChat = async () => {
    try {
      await getCurrentLocation();
      
      if (userLocation) {
        const locationMessage: Message = {
          id: Date.now().toString(),
          content: `📍 **My Current Location**\n\n${userLocation.address || `Coordinates: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`}\n\n*Shared at ${new Date().toLocaleTimeString()}*`,
          sender: 'user',
          timestamp: new Date(),
          type: 'resource'
        };

        setMessages(prev => [...prev, locationMessage]);

        // Bot response with location-based services
        setTimeout(async () => {
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: `**Thank you for sharing your location!** 📍\n\nI can now help you with:\n\n• **Nearby mental health services** 🏥\n• **Emergency contacts** in your area 📞\n• **Local support groups** 👥\n• **Crisis centers** near you 🆘\n\nWould you like me to find **mental health resources** in your area?`,
            sender: 'bot',
            timestamp: new Date(),
            type: 'suggestion'
          };

          setMessages(prev => [...prev, botResponse]);
          
          try {
            // Save location messages to DynamoDB
            await fetch('/api/chat-memory', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: sessionId,
                role: 'user',
                message: locationMessage.content,
              }),
            });
            
            await fetch('/api/chat-memory', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: sessionId,
                role: 'assistant',
                message: botResponse.content,
              }),
            });
          } catch (error) {
            console.error('Failed to save location messages:', error);
          }
        }, 1000);

        toast({
          title: "📍 Location Shared",
          description: "Your location has been shared securely in the chat.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to share location:', error);
    }
  };

  // Initialize Spline and motion preferences
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    // Load Spline after component mount
    if (!reducedMotion) {
      const timer = setTimeout(() => {
        setSplineLoaded(true);
      }, 1000);
      return () => clearTimeout(timer);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [reducedMotion]);

  // Enhanced auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    // Scroll using messagesEndRef first
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
    // Fallback for scroll area - ensure it scrolls to bottom
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      const scrollToValue = scrollElement.scrollHeight;
      
      // Smooth scroll for better UX
      scrollElement.scrollTo({
        top: scrollToValue,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scroll on new messages and typing state changes with slight delay
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  const generateBotResponse = async (userMessage: string): Promise<Message> => {
    try {
      // Call our enhanced chatbot API route with crisis detection
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          sessionId: sessionId,
          userId: User // Pass userId for DynamoDB tracking
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update crisis level state
          if (data.crisisLevel) {
            setCrisisLevel(data.crisisLevel);
          }
          
          // Show SMS alert notification if crisis detected
          if (data.smsAlertSent && data.crisisLevel && ['high', 'critical'].includes(data.crisisLevel)) {
            toast({
              title: "🚨 Crisis Support Activated",
              description: `Emergency alert sent to counselor. Crisis level: ${data.crisisLevel}. Help is on the way.`,
              duration: 10000,
            });
          }

          return {
            id: Date.now().toString(),
            content: data.message,
            sender: 'bot',
            timestamp: new Date(),
            type: data.fallback ? 'warning' : 
                  data.crisisLevel === 'critical' ? 'warning' :
                  data.crisisLevel === 'high' ? 'warning' : 
                  data.crisisLevel === 'medium' ? 'suggestion' : undefined,
          };
        }
      }
    } catch (error) {
      console.error('Chatbot API error:', error);
    }

    // Enhanced fallback responses if API fails
    const lowerMessage = userMessage.toLowerCase();
    
    // Analyze user message for keywords and provide appropriate responses with formatting
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
      return {
        id: Date.now().toString(),
        content: "**I understand you're feeling anxious.** 💙\n\nAnxiety is common during college years. Here's a **quick breathing exercise**:\n\n1. **Breathe in** for 4 counts\n2. **Hold** for 4 counts  \n3. **Exhale** for 6 counts\n\nTry this 3 times. Would you like me to guide you through more **coping strategies**?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'suggestion'
      };
    }
    
    if (lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed') || lowerMessage.includes('pressure')) {
      return {
        id: Date.now().toString(),
        content: "**Feeling overwhelmed is completely normal** when dealing with academic pressures. 🎓\n\nLet's break this down:\n\n• What's the **main source** of your stress right now?\n• Sometimes just **talking about it** helps us find manageable solutions\n\n**You're not alone** in feeling this way.",
        sender: 'bot',
        timestamp: new Date(),
      };
    }
    
    if (lowerMessage.includes('depressed') || lowerMessage.includes('sad') || lowerMessage.includes('hopeless')) {
      return {
        id: Date.now().toString(),
        content: "**I'm concerned about how you're feeling.** ❤️\n\nThese emotions are important and deserve attention. While I can offer support, I **strongly recommend** speaking with a professional counselor.\n\n**Would you like me to help you:**\n• Schedule an appointment with campus mental health services\n• Find crisis support resources\n\n**You deserve professional care.**",
        sender: 'bot',
        timestamp: new Date(),
        type: 'warning'
      };
    }
    
    if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('tired')) {
      return {
        id: Date.now().toString(),
        content: "**Sleep issues can significantly impact your mental health.** 😴\n\n**Here are some tips:**\n\n1. Set a **consistent sleep schedule**\n2. **Avoid screens** 1 hour before bed\n3. Try **relaxation techniques** like progressive muscle relaxation\n\nWould you like me to share some **guided sleep resources**?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'resource'
      };
    }
    
    if (lowerMessage.includes('exam') || lowerMessage.includes('test') || lowerMessage.includes('study')) {
      return {
        id: Date.now().toString(),
        content: "**Academic stress is very common!** 📚\n\n**Effective study strategies:**\n\n1. Break sessions into **25-minute chunks**\n2. Practice **active recall** instead of re-reading\n3. Take **regular breaks** to prevent burnout\n\n**Remember:** Your worth isn't defined by grades. How can I help you create a **manageable study plan**?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'suggestion'
      };
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('counselor') || lowerMessage.includes('therapy')) {
      return {
        id: Date.now().toString(),
        content: "**I'm glad you're seeking help** - that takes courage! 🌟\n\nOur campus has **excellent mental health resources**. I can help you:\n\n1. **Schedule** a counseling appointment\n2. Find **peer support groups**\n3. Access **crisis support** if needed\n4. **Find nearby services** with your location 📍\n\n**What kind of support** would be most helpful for you right now?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'resource'
      };
    }

    if (lowerMessage.includes('nearby') || lowerMessage.includes('location') || lowerMessage.includes('near me') || lowerMessage.includes('find mental health')) {
      return {
        id: Date.now().toString(),
        content: `**I can help you find nearby mental health services!** 📍\n\n${userLocation ? 
          `Based on your location: **${userLocation.address || 'Current location'}**\n\n` : 
          'To find services near you, please **share your location** first.\n\n'
        }**Available nearby services:**\n\n• **Mental health clinics** 🏥\n• **Crisis intervention centers** 🆘\n• **Support groups** 👥\n• **Emergency services** 📞\n\n${!userLocation ? 'Click the **location button** below to share your location securely.' : 'Would you like specific contact information for any of these services?'}`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'resource'
      };
    }
    
    if (lowerMessage.includes('good') || lowerMessage.includes('better') || lowerMessage.includes('fine') || lowerMessage.includes('okay')) {
      return {
        id: Date.now().toString(),
        content: "**That's wonderful to hear!** 🎉\n\nI'm glad you're doing well. Remember:\n\n• It's great to **check in** even when things are going smoothly\n• **Self-care** is important during good times too\n\nIs there anything specific that's been helping you maintain your **positive mood**? Sharing strategies can help other students too! ✨",
        sender: 'bot',
        timestamp: new Date(),
      };
    }

    // Default supportive responses with formatting
    const defaultResponses = [
      "**Thank you for sharing that with me.** 💙\n\nYour feelings are **valid and important**. Can you tell me more about what's been on your mind?\n\n• I'm here to listen\n• Your mental health matters\n• You're not alone",
      "**I appreciate you opening up.** 🌟\n\nMental health is a journey, and I'm here to support you through it.\n\n**What would be most helpful for you right now?**\n• Coping strategies\n• Someone to listen\n• Professional resources",
      "**It sounds like you're going through something important.** ❤️\n\nWould you like to:\n\n• Explore some **coping strategies**\n• Talk about what's bothering you\n• Learn about **support resources**\n\n**I'm here for you.**",
      "**I'm here to listen and support you.** 🤗\n\nEvery step you take toward caring for your mental health matters, no matter how small it might seem.\n\n**You're taking a positive step** by reaching out today."
    ];
    
    return {
      id: Date.now().toString(),
      content: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
      sender: 'bot',
      timestamp: new Date(),
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageContent = inputMessage.trim();

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Scroll to bottom after adding user message
    setTimeout(() => scrollToBottom(), 50);

    // Show confirmation toast
    toast({
      title: "Message sent",
      description: "Your message has been received. Our AI is thinking...",
      duration: 2000,
    });

    // Simulate bot typing delay
    setTimeout(async () => {
      // Get AI response with integrated crisis detection
      const botResponse = await generateBotResponse(messageContent);

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      
      // Save messages to DynamoDB
      try {
        // Save user message
        await fetch('/api/chat-memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: sessionId,
            role: 'user',
            message: messageContent,
          }),
        });
        
        // Save bot response
        await fetch('/api/chat-memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: sessionId,
            role: 'assistant',
            message: botResponse.content,
            risk_level: botResponse.type === 'warning' ? 'mild' : 'normal',
          }),
        });
      } catch (error) {
        console.error('Failed to save messages:', error);
      }
      
      // Scroll to bottom after bot response
      setTimeout(() => scrollToBottom(), 100);
      
      // Show response notification
      toast({
        title: "AI Response Ready",
        description: "Your mental health companion has responded.",
        duration: 3000,
      });
    }, 1500);
  };

  // Clear chat history and start new session
  const clearChatHistory = async () => {
    try {
      // Delete old chat history from DynamoDB
      await fetch(`/api/chat-memory?userId=${sessionId}`, {
        method: 'DELETE',
      });
      
      // Create new session ID
      const newSessionId = `user-${Date.now()}`;
      setSessionId(newSessionId);
      
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: "**Hello! I'm Mann Mitra, your AI mental health companion.** 🤗\n\nI'm here to:\n\n• **Listen** to your concerns\n• **Support** you through challenges  \n• **Guide** you toward helpful resources\n\n**How are you feeling today?** ✨",
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
      
      // Save welcome message to new session
      await fetch('/api/chat-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: newSessionId,
          role: 'assistant',
          message: welcomeMessage.content,
        }),
      });
      
      toast({
        title: "Chat Cleared",
        description: "Started a new conversation session.",
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to clear chat:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat history.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleQuickAction = (actionText: string) => {
    setInputMessage(actionText);
    
    // Show feedback for quick action selection
    toast({
      title: "Quick Action Selected",
      description: `"${actionText}" has been added to your message. Click send to continue.`,
      duration: 3000,
    });

    // Auto-focus the input field
    setTimeout(() => {
      const inputElement = document.querySelector('input[placeholder="Share what\'s on your mind..."]') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 100);
  };

  const quickActions = [
    { text: "I'm feeling anxious", icon: AlertTriangle },
    { text: "Suggest me songs", icon: Lightbulb },
    { text: "Suggest me motivational movies", icon: Lightbulb },
    { text: "Tell me a motivational quote", icon: Lightbulb },
    { text: "Book counselor appointment", icon: Calendar },
    { text: "Find nearby mental health services", icon: MapPin },
    { text: "Emergency support", icon: Phone }
  ];

  return (
    <div className="relative h-full w-full md:space-y-6">
      {/* Spline Background - Fixed positioning */}
<<<<<<< HEAD
      <div className="fixed inset-0 -z-50 overflow-hidden">
        {!reducedMotion ? (
          <Suspense fallback={
            <div className="w-full h-full bg-gradient-to-br from-blue-50/30 to-teal-50/30" />
          }>
          </Suspense>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50/30 to-teal-50/30" />
        )}
      </div>
=======
  <div className="fixed inset-0 -z-50 overflow-hidden">
    {!reducedMotion ? (
      <Suspense fallback={
        <div className="w-full h-full bg-gradient-to-br from-blue-50/30 to-teal-50/30" />
      }>
   
      </Suspense>
    ) : (
      <div className="w-full h-full bg-gradient-to-br from-blue-50/30 to-teal-50/30" />
    )}
  </div>
>>>>>>> 33ab2b9 (add bottom navbar)
      
      {/* WhatsApp-Style Chat Container - Full screen on mobile */}
      <Card className="backdrop-blur-sm bg-white/95 border-white/50 shadow-xl relative z-10 overflow-hidden h-full w-full md:h-auto flex flex-col md:border md:rounded-lg border-none rounded-none">
        {/* WhatsApp-Style Header - Hidden on mobile (shown in navbar) */}
        <div className="hidden md:flex bg-teal-700 text-white px-4 py-3 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Mann Mitra</h3>
              <p className="text-xs text-teal-100">Your AI mental health companion</p>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChatHistory}
              className="text-white hover:bg-teal-600 h-8 px-2 text-xs"
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            {isLoading && (
              <div className="flex items-center text-xs text-teal-100">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-0 flex-1 flex flex-col h-full md:h-auto overflow-hidden">
          {/* Loading State */}
          {isLoading ? (
            <div className="h-full md:h-[500px] flex items-center justify-center bg-gradient-to-br from-teal-50/30 to-green-50/30">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-teal-600" />
                <p className="text-sm text-gray-600">Loading your conversation...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Messages Area with WhatsApp Background - Full screen on mobile */}
              <div 
                className="flex-1 overflow-y-auto bg-gradient-to-br from-teal-50/30 to-green-50/30 relative h-full"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2314b8a6' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '60px 60px'
                }}
                ref={scrollAreaRef}
              >
                {/* Floating Clear Chat Button - Mobile Only */}
                <div className="md:hidden absolute top-2 right-2 z-10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearChatHistory}
                    className="bg-white/90 backdrop-blur-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-md h-8 px-2"
                    title="Clear chat history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                
                <div className="py-4">
                  <ChatMessages messages={messages} isTyping={isTyping} messagesEndRef={messagesEndRef} />
                </div>
              </div>

              {/* Location Sharing Section - Compact */}
              {!userLocation && locationPermission !== 'denied' && (
                <div className="px-4 py-2 bg-blue-50/80 border-t border-blue-200 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">
                        Share location for personalized support
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareLocationInChat}
                      className="text-xs h-7 hover:bg-blue-50 border-blue-300"
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              )}

              {/* Message Input Area - WhatsApp Style */}
              <div className="p-3 bg-gray-50 border-t border-gray-200 flex-shrink-0">
                <ChatInput
                  inputMessage={inputMessage}
                  setInputMessage={setInputMessage}
                  handleSendMessage={handleSendMessage}
                  isTyping={isTyping}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Crisis Support Card - Only show when crisis level is medium or higher */}
      {crisisLevel && ['medium', 'high', 'critical'].includes(crisisLevel) && (
      <Card className={`backdrop-blur-sm shadow-md ${
        crisisLevel === 'critical' || crisisLevel === 'high' 
          ? 'border-red-300 bg-gradient-to-br from-red-50/80 to-orange-50/80 animate-pulse' 
          : 'border-primary/20 bg-gradient-to-br from-blue-50/80 to-green-50/80'
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-wellness rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-primary mb-3 flex items-center">
                <Heart className="w-4 h-4 mr-2 text-red-500" />
                You're Worth the Call
              </h3>
              
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                Taking care of your mental health is one of the strongest things you can do. 
                If you're struggling, reaching out is a sign of <strong>courage, not weakness</strong>.
              </p>

              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-r-lg">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="font-semibold text-red-800">Crisis Support - Available 24/7</span>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-red-700">
                    📞 1800-599-0019
                  </p>
                  <p className="text-sm text-red-600">
                    KIRAN Mental Health Helpline
                  </p>
                  
                  {userLocation && (
                    <div className="mt-2 p-2 bg-red-100 rounded">
                      <p className="text-xs text-red-700 font-medium">
                        📍 Your Location: {userLocation.address || `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Emergency responders can be directed to your current location if needed.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      ✓ Free & Confidential
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      ✓ Trained Professionals
                    </span>
                    {userLocation && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        ✓ Location Shared
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <Brain className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800 text-sm">Campus Counseling</span>
                  </div>
                  <p className="text-xs text-blue-600">Professional support on campus</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <Calendar className="w-4 h-4 text-green-600 mr-2" />
                    <span className="font-medium text-green-800 text-sm">Book Appointment</span>
                  </div>
                  <p className="text-xs text-green-600">Schedule with a counselor</p>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 text-center">
                <p className="text-sm text-primary font-medium">
                  💡 Remember: Every step toward getting help is a victory. You're not alone! 🌈
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
};

export default ChatBot;