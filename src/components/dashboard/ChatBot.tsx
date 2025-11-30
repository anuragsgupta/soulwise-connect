"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ChatMessages, { Message, QuickReply, ResourceAction } from "./ChatMessages";
import ChatInput from "./ChatInput";
import AnonymousMentorChat from "./AnonymousMentorChat";
import { 
  Bot, 
  Heart, 
  Brain,
  Phone,
  AlertTriangle,
  Calendar,
  Trash2,
  RefreshCw,
  MapPin,
  Navigation,
  UserCircle
} from "lucide-react";

// Lazy load Spline component
// const Spline = lazy(() => import('@splinetool/react-spline/next'));

type SupportOptions = Pick<Message, 'quickReplies' | 'resourceCard'>;

const randomId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const buildQuickReplies = (items: Array<{ label: string; value: string }>): QuickReply[] =>
  items.map((item) => ({
    id: randomId('qr'),
    label: item.label,
    value: item.value,
  }));

const buildResourceActions = (actions: Array<Omit<ResourceAction, 'id'>>): ResourceAction[] =>
  actions.map((action) => ({
    ...action,
    id: randomId('act'),
  }));

const buildResourceCard = (config: {
  title: string;
  subtitle?: string;
  description: string;
  tag?: string;
  actions: Array<Omit<ResourceAction, 'id'>>;
}): SupportOptions['resourceCard'] => ({
  title: config.title,
  subtitle: config.subtitle,
  description: config.description,
  tag: config.tag,
  actions: buildResourceActions(config.actions),
});

const splitIntoFriendlyBursts = (text: string): string[] => {
  if (!text) return [];
  const normalized = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const sentences = normalized.split(/(?<=[.!?])\s+/);
  const bursts: string[] = [];
  let current = '';

  const flushCurrent = () => {
    if (current.trim()) {
      bursts.push(current.trim());
      current = '';
    }
  };

  for (const sentence of sentences) {
    if (!sentence) continue;
    const candidate = current ? `${current} ${sentence}`.trim() : sentence;

    if (candidate.length <= 120) {
      current = candidate;
      continue;
    }

    flushCurrent();

    if (sentence.length <= 120) {
      current = sentence;
      continue;
    }

    let chunk = sentence;
    while (chunk.length > 120) {
      bursts.push(chunk.slice(0, 120).trim());
      chunk = chunk.slice(120);
    }
    current = chunk.trim();
  }

  flushCurrent();

  return bursts.length ? bursts.slice(0, 4) : [normalized];
};

const buildFriendlyMessages = (
  baseMessage: Message,
  quickReplies?: QuickReply[],
  resourceCard?: SupportOptions['resourceCard']
): Message[] => {
  const baseId = baseMessage.id || randomId('msg');
  const bursts = splitIntoFriendlyBursts(baseMessage.content);

  if (bursts.length === 0) {
    return [{
      ...baseMessage,
      id: baseId,
      quickReplies,
      resourceCard,
    }];
  }

  return bursts.map((content, index) => ({
    ...baseMessage,
    id: bursts.length === 1 ? baseId : `${baseId}-${index + 1}`,
    content,
    quickReplies: index === bursts.length - 1 ? quickReplies : undefined,
    resourceCard: index === bursts.length - 1 ? resourceCard : undefined,
  }));
};

const cleanForQuickReply = (text: string) =>
  text
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const extractFollowUpQuestions = (text?: string): string[] => {
  if (!text) return [];
  const sanitized = cleanForQuickReply(text);
  const matches = sanitized.match(/[^?.!]*\?/g);
  return matches ? matches.map((q) => q.trim()).filter(Boolean) : [];
};

const transformQuestionToResponse = (question: string): string => {
  const trimmed = cleanForQuickReply(question).replace(/\?+$/, '');
  if (!trimmed) return '';

  const templates: Array<{ regex: RegExp; build: (match: RegExpMatchArray) => string }> = [
    {
      regex: /^would you like me to (.+)$/i,
      build: (match) => `Yes, please ${match[1].trim()}.`,
    },
    {
      regex: /^would you like to (.+)$/i,
      build: (match) => `Yes, I'd like to ${match[1].trim()}.`,
    },
    {
      regex: /^do you want to (.+)$/i,
      build: (match) => `Yes, let's ${match[1].trim()}.`,
    },
    {
      regex: /^should we (.+)$/i,
      build: (match) => `Yes, let's ${match[1].trim()}.`,
    },
    {
      regex: /^can i (.+)$/i,
      build: (match) => `Please ${match[1].trim()}.`,
    },
    {
      regex: /^can you (.+)$/i,
      build: (match) => `Please ${match[1].trim()}.`,
    },
    {
      regex: /^would it help if i (.+)$/i,
      build: (match) => `Yes, it would help if you ${match[1].trim()}.`,
    },
  ];

  for (const template of templates) {
    const match = trimmed.match(template.regex);
    if (match) {
      return template.build(match).replace(/\s+/g, ' ').trim();
    }
  }

  return `${trimmed}?`;
};

const buildKeywordFallbackReplies = (context: string): Array<{ label: string; value: string }> => {
  const normalized = context.toLowerCase();
  const suggestions: Array<{ label: string; value: string }> = [];
  const pushUnique = (label: string, value: string) => {
    if (!suggestions.some((item) => item.value === value)) {
      suggestions.push({ label, value });
    }
  };

  if (/(breath|calm|ground|anxious|anxiety)/.test(normalized)) {
    pushUnique('Guide a calming exercise', 'Can you guide me through that calming exercise you mentioned?');
  }

  if (/(sleep|rest|insomnia|bedtime)/.test(normalized)) {
    pushUnique('Share a sleep routine', 'Could you help me build that sleep routine you referenced?');
  }

  if (/(study|exam|assignment|focus|productivity)/.test(normalized)) {
    pushUnique('Help with study plan', "Let's create the focused study plan you suggested.");
  }

  if (/(counsel|therap|support group|appointment)/.test(normalized)) {
    pushUnique('Connect me to support', 'Please connect me with a counselor or support pathway.');
  }

  if (!suggestions.length) {
    pushUnique('Tell me more ideas', 'Can you share a few more ideas based on that?');
  }

  return suggestions.slice(0, 3);
};

const buildContextualQuickReplies = (botContent?: string, userMessage?: string): QuickReply[] => {
  if (!botContent) return [];
  const questionReplies = extractFollowUpQuestions(botContent)
    .map((question) => transformQuestionToResponse(question))
    .filter((reply) => reply && reply.length > 0)
    .slice(0, 3)
    .map((reply) => ({
      id: randomId('qr'),
      label: reply.length > 48 ? `${reply.slice(0, 45)}...` : reply,
      value: reply,
    }));

  if (questionReplies.length) {
    return questionReplies;
  }

  return buildKeywordFallbackReplies(`${botContent} ${userMessage || ''}`).map((suggestion) => ({
    id: randomId('qr'),
    label: suggestion.label,
    value: suggestion.value,
  }));
};

const calmingSupportOptions = (): SupportOptions => ({
  quickReplies: buildQuickReplies([
    { label: 'Breathing exercise', value: 'Can you guide me through a calming breathing exercise?' },
    { label: 'Grounding games', value: 'Show me a grounding activity to help me feel calmer.' },
    { label: 'Talk to counselor', value: 'I would like to speak with a counselor.' },
  ]),
  resourceCard: buildResourceCard({
    title: 'Calming Support Toolkit',
    subtitle: 'Take a mindful pause',
    description: 'Try guided breathing, grounding games, or connect with a counselor when anxiety feels heavy.',
    tag: 'Guided Support',
    actions: [
      { label: 'Play Exercise 🎯', type: 'launch-exercise', value: 'breathing-ball', variant: 'primary' },
      { label: 'Browse all resources', type: 'navigate', value: 'resources', variant: 'secondary' },
      { label: 'Maybe later', type: 'dismiss', variant: 'ghost' },
    ],
  }),
});

const sleepSupportOptions = (): SupportOptions => ({
  quickReplies: buildQuickReplies([
    { label: 'Better sleep tips', value: 'Share more tips to improve my sleep.' },
    { label: 'Relaxation audio', value: 'Do you have a relaxation exercise for bedtime?' },
    { label: 'Track my sleep', value: 'Help me build a simple sleep routine.' },
  ]),
  resourceCard: buildResourceCard({
    title: 'Rest & Recharge Plan',
    subtitle: 'Sleep hygiene boosts mood',
    description: 'Explore bedtime routines, calming audio, and reflective journaling to reset your sleep.',
    tag: 'Sleep Care',
    actions: [
      { label: 'Open sleep resources', type: 'navigate', value: 'resources', variant: 'primary' },
      { label: 'Set a bedtime reminder', type: 'message', value: 'Help me set a bedtime reminder routine.' },
      { label: 'Maybe later', type: 'dismiss', variant: 'ghost' },
    ],
  }),
});

const professionalSupportOptions = (): SupportOptions => ({
  quickReplies: buildQuickReplies([
    { label: 'Book a counselor', value: 'Please help me book a counseling appointment.' },
    { label: 'Peer support', value: 'Show me peer support groups I can join.' },
    { label: 'Crisis helplines', value: 'Share crisis helpline information with me.' },
  ]),
  resourceCard: buildResourceCard({
    title: 'Personalised Support Pathways',
    subtitle: 'You deserve professional care',
    description: 'Connect with campus counselors, peer groups, or crisis teams tailored to your needs.',
    tag: 'Professional Support',
    actions: [
      { label: 'Book a session', type: 'navigate', value: 'appointments', variant: 'primary' },
      { label: 'Explore resources', type: 'navigate', value: 'resources', variant: 'secondary' },
      { label: 'Maybe later', type: 'dismiss', variant: 'ghost' },
    ],
  }),
});

const locationSupportOptions = (): SupportOptions => ({
  quickReplies: buildQuickReplies([
    { label: 'Nearby services', value: 'Yes, show me mental health services near me.' },
    { label: 'Emergency contacts', value: 'Share emergency contacts for my area.' },
    { label: 'Maybe later', value: 'Maybe later, thanks.' },
  ]),
  resourceCard: buildResourceCard({
    title: 'Location-Aware Help',
    subtitle: 'Personalised to where you are',
    description: 'Access nearby clinics, crisis centers, and peer spaces so you can get support quickly.',
    tag: 'Safety First',
    actions: [
      { label: 'Find nearby support', type: 'message', value: 'Please share nearby mental health services.' },
      { label: 'Share location', type: 'message', value: 'I want to share my current location details.' },
      { label: 'Maybe later', type: 'dismiss', variant: 'ghost' },
    ],
  }),
});

const generalSupportOptions = (): SupportOptions => ({
  quickReplies: buildQuickReplies([
    { label: 'Share how I feel', value: "I want to talk more about how I'm feeling right now." },
    { label: 'Need coping idea', value: 'Can you share a simple coping idea I can try today?' },
    { label: 'Study pressure help', value: 'Can we talk about managing study or exam stress?' },
  ]),
});

type ProcessMessageOrigin = 'quick-reply' | 'resource-card' | 'default';

interface ProcessMessageOptions {
  showSendToast?: boolean;
  showResponseToast?: boolean;
  origin?: ProcessMessageOrigin;
}


const ChatBot = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [chatMode, setChatMode] = useState<'ai' | 'mentor'>('ai');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>("");
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
        // Use authenticated user ID or demo student for testing
        const currentSessionId = user?.id || 'demo-student-1763748214213';
        const userType = user?.userType || 'DEMO';
        console.log('👤 User ID:', currentSessionId, '| Type:', userType);
        
        setSessionId(currentSessionId);
        
        // Load existing messages from DynamoDB
        const response = await fetch(`/api/chat-memory?userId=${currentSessionId}&action=recent&limit=50`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.messages && data.messages.length > 0) {
            // Convert DynamoDB messages to UI Message format
            const loadedMessages: Message[] = data.messages.map((msg: { timestamp: string; message: string; role: string; created_at: string; risk_level?: string }) => ({
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
            const generalOptions = generalSupportOptions();
            const welcomeMessages = buildFriendlyMessages(
              {
                id: '1',
                content: "Hey, I'm Mann Mitra 👋 Think of me as that friend who checks in late at night. How's your headspace today?",
                sender: 'bot',
                timestamp: new Date(),
                type: 'suggestion',
              },
              generalOptions.quickReplies,
              generalOptions.resourceCard
            );
            setMessages(welcomeMessages);
            
            // Save welcome message to DynamoDB
            await fetch('/api/chat-memory', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: currentSessionId,
                role: 'assistant',
                message: welcomeMessages.map((msg) => msg.content).join('\n\n'),
              }),
            });
          }
        } else {
          throw new Error('Failed to load chat history');
        }
      } catch (error) {
        console.error('Failed to initialize chat storage:', error);
        // Fallback to default welcome message
        const generalOptions = generalSupportOptions();
        setMessages(
          buildFriendlyMessages(
            {
              id: '1',
              content: "Hey, I'm Mann Mitra 👋 Dropping by to check in whenever you need me. What's the vibe today?",
              sender: 'bot',
              timestamp: new Date(),
              type: 'suggestion',
            },
            generalOptions.quickReplies,
            generalOptions.resourceCard
          )
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
    checkLocationPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Check and request location permission
  const checkLocationPermission = async () => {
    if ('geolocation' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(permission.state);
        
        permission.addEventListener('change', () => {
          setLocationPermission(permission.state);
        });
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
          const locationOptions = locationSupportOptions();
          const locationResponses = buildFriendlyMessages(
            {
              id: (Date.now() + 1).toString(),
              content: 'Awesome, got your location pinned. Want me to pull nearby clinics, helplines, or student support rooms?',
              sender: 'bot',
              timestamp: new Date(),
              type: 'suggestion',
            },
            locationOptions.quickReplies,
            locationOptions.resourceCard
          );

          setMessages(prev => [...prev, ...locationResponses]);
          
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
                message: locationResponses.map((res) => res.content).join('\n\n'),
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

  const generateBotResponse = async (userMessage: string): Promise<Message[]> => {
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
          userId: sessionId // Pass userId for DynamoDB tracking
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

          const botMessage: Message = {
            id: Date.now().toString(),
            content: data.message,
            sender: 'bot',
            timestamp: new Date(),
            type: data.fallback ? 'warning' : 
                  data.crisisLevel === 'critical' ? 'warning' :
                  data.crisisLevel === 'high' ? 'warning' : 
                  data.crisisLevel === 'medium' ? 'suggestion' : undefined,
          };

          const dynamicQuickReplies = buildContextualQuickReplies(botMessage.content, userMessage);

          return buildFriendlyMessages(
            botMessage,
            dynamicQuickReplies.length ? dynamicQuickReplies : undefined
          );
        }
      }
    } catch (error) {
      console.error('Chatbot API error:', error);
    }

    // Enhanced fallback responses if API fails
    const lowerMessage = userMessage.toLowerCase();
    
    // Analyze user message for keywords and provide appropriate responses with formatting
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
      const calmingOptions = calmingSupportOptions();
      return buildFriendlyMessages(
        {
          id: Date.now().toString(),
          content: "Hey, I hear the jitters in your note. Slow breath can reset everything. Want me to walk you through that 4-4-6 breath right now?",
          sender: 'bot',
          timestamp: new Date(),
          type: 'suggestion',
        },
        calmingOptions.quickReplies,
        calmingOptions.resourceCard
      );
    }
    
    if (lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed') || lowerMessage.includes('pressure')) {
      const calmingOptions = calmingSupportOptions();
      return buildFriendlyMessages(
        {
          id: Date.now().toString(),
          content: "Totally get how heavy that stack of stress can feel. Let's zoom in on the one thing bugging you most. We can tag-team it from there.",
          sender: 'bot',
          timestamp: new Date(),
          type: 'suggestion',
        },
        calmingOptions.quickReplies,
        calmingOptions.resourceCard
      );
    }
    
    if (lowerMessage.includes('depressed') || lowerMessage.includes('sad') || lowerMessage.includes('hopeless')) {
      const professionalOptions = professionalSupportOptions();
      return buildFriendlyMessages(
        {
          id: Date.now().toString(),
          content: "Hey, I'm really glad you told me. You deserve backup on days like this. Want me to line up a counselor or crisis support so you're not carrying it solo?",
          sender: 'bot',
          timestamp: new Date(),
          type: 'warning',
        },
        professionalOptions.quickReplies,
        professionalOptions.resourceCard
      );
    }
    
    if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('tired')) {
      const sleepOptions = sleepSupportOptions();
      return buildFriendlyMessages(
        {
          id: Date.now().toString(),
          content: "Ugh, broken sleep throws everything off. We can build a chill bedtime loop or try a mini relaxation audio. Want to try that?",
          sender: 'bot',
          timestamp: new Date(),
          type: 'resource',
        },
        sleepOptions.quickReplies,
        sleepOptions.resourceCard
      );
    }
    
    if (lowerMessage.includes('exam') || lowerMessage.includes('test') || lowerMessage.includes('study')) {
      const generalOptions = generalSupportOptions();
      return buildFriendlyMessages(
        {
          id: Date.now().toString(),
          content: "Exam brain is real. Let's carve the work into tiny chunks or sketch a quick study map. Where do you want to start?",
          sender: 'bot',
          timestamp: new Date(),
          type: 'suggestion',
        },
        generalOptions.quickReplies,
        generalOptions.resourceCard
      );
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('counselor') || lowerMessage.includes('therapy')) {
      const professionalOptions = professionalSupportOptions();
      return buildFriendlyMessages(
        {
          id: Date.now().toString(),
          content: "Love that you're reaching out. I can help lock a counselor slot, find peer folks, or share helplines. Which lane feels best?",
          sender: 'bot',
          timestamp: new Date(),
          type: 'resource',
        },
        professionalOptions.quickReplies,
        professionalOptions.resourceCard
      );
    }

    if (lowerMessage.includes('nearby') || lowerMessage.includes('location') || lowerMessage.includes('near me') || lowerMessage.includes('find mental health')) {
      const locationOptions = locationSupportOptions();
      return buildFriendlyMessages(
        {
          id: Date.now().toString(),
          content: userLocation
            ? `Got your location noted (${userLocation.address || 'current spot'}). Want nearby clinics, helplines, or peer spaces?`
            : 'Happy to scout nearby support, just tap the location share so I can pull the right list.',
          sender: 'bot',
          timestamp: new Date(),
          type: 'resource',
        },
        locationOptions.quickReplies,
        locationOptions.resourceCard
      );
    }
    
    if (lowerMessage.includes('good') || lowerMessage.includes('better') || lowerMessage.includes('fine') || lowerMessage.includes('okay')) {
      const generalOptions = generalSupportOptions();
      return buildFriendlyMessages(
        {
          id: Date.now().toString(),
          content: "Love that you're feeling okay! Let's still stash a few go-to habits for the next wobbly day. What's been working lately?",
          sender: 'bot',
          timestamp: new Date(),
          type: 'suggestion',
        },
        generalOptions.quickReplies,
        generalOptions.resourceCard
      );
    }

    // Default supportive responses, short and friendly
    const defaultResponses = [
      "Thanks for trusting me with that. Want to unpack it a bit more?",
      "Sounds like a lot. I'm hanging out right here with you.",
      "Totally here for the messy middle. What's the part bugging you most?",
      "Got you. Want ideas, a vent space, or just a reminder to breathe?"
    ];
    
    const generalOptions = generalSupportOptions();
    return buildFriendlyMessages(
      {
        id: Date.now().toString(),
        content: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
        sender: 'bot',
        timestamp: new Date(),
        type: 'suggestion',
      },
      generalOptions.quickReplies,
      generalOptions.resourceCard
    );
  };

  const processUserMessage = async (messageContent: string, options: ProcessMessageOptions = {}) => {
    const trimmedMessage = messageContent.trim();
    if (!trimmedMessage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: trimmedMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => scrollToBottom(), 50);

    const shouldShowSendToast = options.showSendToast ?? true;
    if (shouldShowSendToast) {
      toast({
        title: options.origin === 'quick-reply' ? 'Quick reply sent' : 'Message sent',
        description:
          options.origin === 'quick-reply'
            ? 'Sending your response to Mann Mitra...'
            : 'Your message has been received. Our AI is thinking...',
        duration: 2000,
      });
    }

    setTimeout(async () => {
      const botResponses = await generateBotResponse(trimmedMessage);
      const responsesToUse = botResponses.length
        ? botResponses
        : buildFriendlyMessages({
            id: Date.now().toString(),
            content: "Hey, I'm still here. Mind sending that once more?",
            sender: 'bot',
            timestamp: new Date(),
          });

      setMessages((prev) => [...prev, ...responsesToUse]);
      setIsTyping(false);

      try {
        await fetch('/api/chat-memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: sessionId,
            role: 'user',
            message: trimmedMessage,
          }),
        });

        await fetch('/api/chat-memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: sessionId,
            role: 'assistant',
            message: responsesToUse.map((res) => res.content).join('\n\n'),
            risk_level: responsesToUse[responsesToUse.length - 1]?.type === 'warning' ? 'mild' : 'normal',
          }),
        });
      } catch (error) {
        console.error('Failed to save messages:', error);
      }

      setTimeout(() => scrollToBottom(), 100);

      const shouldShowResponseToast = options.showResponseToast ?? true;
      if (shouldShowResponseToast) {
        toast({
          title: 'AI Response Ready',
          description: 'Your mental health companion has responded.',
          duration: 3000,
        });
      } else if (options.origin === 'quick-reply') {
        toast({
          title: 'Response ready',
          description: 'Mann Mitra replied to your quick response.',
          duration: 2500,
        });
      }
    }, 1200);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isTyping) return;

    const outgoingMessage = inputMessage;
    setInputMessage('');
    processUserMessage(outgoingMessage, { origin: 'default' });
  };

  const handleQuickReply = (messageId: string, value: string) => {
    if (isTyping) return;

    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, quickReplies: undefined } : msg))
    );

    processUserMessage(value, {
      showSendToast: false,
      origin: 'quick-reply',
    });
  };

  const handleResourceAction = (messageId: string, action: ResourceAction) => {
    const removeResourceCard = () => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, resourceCard: undefined } : msg))
      );
    };

    if (action.type === 'message' && action.value) {
      if (isTyping) return;

      removeResourceCard();
      processUserMessage(action.value, {
        showSendToast: false,
        origin: 'resource-card',
      });
      return;
    }

    if (action.type === 'navigate' && action.value) {
      removeResourceCard();

      window.dispatchEvent(
        new CustomEvent('dashboard:navigate', {
          detail: { tab: action.value, source: 'chatbot', triggeredAt: Date.now() },
        })
      );

      toast({
        title: 'Opening support space',
        description:
          action.value === 'resources'
            ? 'Switching to the resource hub for guided support.'
            : action.value === 'appointments'
            ? 'Routing you to the counselor booking experience.'
            : 'Navigating to the requested support area.',
        duration: 3000,
      });
      return;
    }

    if (action.type === 'launch-exercise' && action.value) {
      removeResourceCard();

      // Dispatch event to open the specific exercise
      window.dispatchEvent(
        new CustomEvent('resource:launch-exercise', {
          detail: { exerciseId: action.value, source: 'chatbot' },
        })
      );

      toast({
        title: '🌬️ Starting exercise',
        description: 'Launching your breathing exercise now. Take a deep breath...',
        duration: 3000,
      });
      return;
    }

    if (action.type === 'dismiss') {
      removeResourceCard();
    }
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
      
      const generalOptions = generalSupportOptions();
      const welcomeMessages = buildFriendlyMessages(
        {
          id: Date.now().toString(),
          content: "Fresh start! I'm still here anytime you need a quick vent. What's going on right now?",
          sender: 'bot',
          timestamp: new Date(),
          type: 'suggestion',
        },
        generalOptions.quickReplies,
        generalOptions.resourceCard
      );
      
      setMessages(welcomeMessages);
      
      // Save welcome message to new session
      await fetch('/api/chat-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: newSessionId,
          role: 'assistant',
          message: welcomeMessages.map((msg) => msg.content).join('\n\n'),
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

  return (
    <div className="relative h-full w-full md:space-y-6">
      {/* Spline Background - Fixed positioning */}
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
          <div className="flex items-center space-x-2">
            {/* Chat Mode Toggle */}
            <div className="flex space-x-1 bg-teal-800/50 rounded-lg p-1">
              <Button
                variant={chatMode === 'ai' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChatMode('ai')}
                className={`h-8 px-3 text-xs ${
                  chatMode === 'ai' 
                    ? 'bg-white text-teal-700 hover:bg-white/90' 
                    : 'text-white hover:bg-teal-600'
                }`}
              >
                <Bot className="w-3.5 h-3.5 mr-1" />
                AI Support
              </Button>
              <Button
                variant={chatMode === 'mentor' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChatMode('mentor')}
                className={`h-8 px-3 text-xs ${
                  chatMode === 'mentor' 
                    ? 'bg-white text-teal-700 hover:bg-white/90' 
                    : 'text-white hover:bg-teal-600'
                }`}
              >
                <UserCircle className="w-3.5 h-3.5 mr-1" />
                Mentor Chat
              </Button>
            </div>
            
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
          {/* Mobile Header with Toggle - Shown on mobile only */}
          <div className="md:hidden bg-teal-700 text-white px-3 py-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Mann Mitra</h3>
              </div>
            </div>
            <div className="flex space-x-1 bg-teal-800/50 rounded-md p-0.5">
              <Button
                variant={chatMode === 'ai' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChatMode('ai')}
                className={`h-7 px-2 text-xs ${
                  chatMode === 'ai' 
                    ? 'bg-white text-teal-700 hover:bg-white/90' 
                    : 'text-white hover:bg-teal-600'
                }`}
              >
                <Bot className="w-3 h-3 mr-0.5" />
                AI
              </Button>
              <Button
                variant={chatMode === 'mentor' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChatMode('mentor')}
                className={`h-7 px-2 text-xs ${
                  chatMode === 'mentor' 
                    ? 'bg-white text-teal-700 hover:bg-white/90' 
                    : 'text-white hover:bg-teal-600'
                }`}
              >
                <UserCircle className="w-3 h-3 mr-0.5" />
                Mentor
              </Button>
            </div>
          </div>
          
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
              {chatMode === 'ai' ? (
                <>
                  {/* Chat Messages Area with WhatsApp Background - Full screen on mobile */}
                  <div 
                    className="flex-1 overflow-y-auto bg-gradient-to-br from-teal-80/50 to-green-80/50 relative h-full"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2314b8a6' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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
                      <ChatMessages
                        messages={messages}
                        isTyping={isTyping}
                        messagesEndRef={messagesEndRef}
                        onQuickReply={handleQuickReply}
                        onResourceAction={handleResourceAction}
                      />
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
              ) : (
                <AnonymousMentorChat />
              )}
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
                You&apos;re Worth the Call
              </h3>
              
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                Taking care of your mental health is one of the strongest things you can do. 
                If you&apos;re struggling, reaching out is a sign of <strong>courage, not weakness</strong>.
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
                  💡 Remember: Every step toward getting help is a victory. You&apos;re not alone! 🌈
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