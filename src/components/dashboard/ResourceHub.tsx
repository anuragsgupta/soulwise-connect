"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Play,
  Headphones,
  Download,
  Heart,
  Brain,
  Search,
  Clock,
  Star,
  Volume2,
  FileText,
  Video,
  Wind,
  Gamepad2,
  Activity,
  X,
  Pause,
  SkipBack,
  SkipForward,
  Share2,
  BookmarkPlus,
  ThumbsUp 
} from "lucide-react";

// Game Imports
import BreathingBall from "./games/BreathingBall";
import BoxBreathing from "./games/BoxBreathing";
import CalmCircle from "./games/CalmCircle";
import ZenWaterRipple from "./games/ZenWaterRipple";
import MandalaColorPicker from "./games/MandalaColorPicker";
import FallingLeavesGrounding from "./games/FallingLeavesGrounding";

// Exercise Imports
import FourSevenEightBreathing from "./exercises/FourSevenEightBreathing";
import BreathAwareness from "./exercises/BreathAwareness";
import MorningEnergizer from "./exercises/MorningEnergizer";
import AnxietyRelease from "./exercises/AnxietyRelease";

// --- TYPES ---
interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'article' | 'guide' | 'exercise' | 'game';
  category: 'anxiety' | 'depression' | 'stress' | 'sleep' | 'mindfulness' | 'academic' | 'breathing' | 'games';
  duration?: string;
  rating: number;
  downloads: number;
  thumbnail?: string;
  url?: string;
  content?: string;
}

// --- HELPER COMPONENT: Full Screen Modal Wrapper ---
// This ensures Games, Exercises, and Audio cover the page consistently
const FullScreenModalWrapper = ({ 
  children
}: { 
  children: React.ReactNode
}) => {
  return (
    <div>
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Content Area - Full Width/Height */}
      <div className="flex-1 overflow-y-auto w-full h-full relative">
        {children}
      </div>
    </div>
    </div>
  );
};

// --- COMPONENT: VideoResourceModal ---
interface VideoModalProps {
  resource: Resource;
  onClose: () => void;
}

interface VideoModalProps {
  resource: Resource;
  onClose: () => void;
}

const VideoResourceModal = ({ resource, onClose }: VideoModalProps) => {
  // Helper to get embed URL
  const getYouTubeEmbedUrl = (url: string | undefined) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) 
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` 
      : url;
  };

  const embedUrl = getYouTubeEmbedUrl(resource.url);

  return (
    // 1. Overlay: Dark backdrop with blur, fixed to cover entire screen
    <div>
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* 2. Main Container: Responsive width, max-height handling */}
      <div className="relative w-full max-w-5xl bg-background sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[90vh] border-none sm:border border-white/10">
        
        {/* Header: Sticky on mobile so Close button is always accessible */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur z-10 sticky top-0 sm:static">
          <div className="flex flex-col gap-1 pr-8">
            <h2 className="text-lg sm:text-xl font-bold line-clamp-1 flex items-center gap-2">
              <Video className="w-5 h-5 text-red-500 fill-red-500" />
              {resource.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
               <Badge variant="secondary" className="text-[10px] h-5 px-1.5 uppercase tracking-wider font-semibold">
                 {resource.category}
               </Badge>
               <span className="hidden sm:inline">•</span>
               <span className="flex items-center gap-1">
                 <Clock className="w-3 h-3" /> {resource.duration}
               </span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="rounded-full hover:bg-muted/50 h-10 w-10 shrink-0"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Content Scroll Wrapper: Allows description to scroll while modal stays fixed height */}
        <div className="overflow-y-auto flex-1 bg-muted/5">
          
          {/* Video Player Container: 16:9 Aspect Ratio */}
          <div className="relative w-full pt-[56.25%] bg-black shadow-inner">
            {embedUrl ? (
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={embedUrl}
                title={resource.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-white/50 bg-neutral-900">
                <Video className="w-12 h-12 mb-2 opacity-50" />
                <p>Video unavailable</p>
              </div>
            )}
          </div>

          {/* Description & Interaction Section */}
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* Action Bar */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {resource.rating}
                  </div>
                  <div className="w-px h-4 bg-border"></div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Download className="w-4 h-4" />
                    {resource.downloads} views
                  </div>
               </div>

               <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2 rounded-full text-xs h-8">
                    <ThumbsUp className="w-3 h-3" /> Like
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 rounded-full text-xs h-8">
                    <Share2 className="w-3 h-3" /> Share
                  </Button>
               </div>
            </div>

            {/* Text Content */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base sm:text-lg">About this video</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {resource.description}
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

// --- COMPONENT: AudioResourceModal (New Pop-up) ---
interface AudioModalProps {
  resource: Resource;
  onClose: () => void;
}

const AudioResourceModal = ({ resource, onClose }: AudioModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Parse duration from string (e.g. "8 min") to seconds, default to 300 (5 mins)
  const getDurationInSeconds = useCallback(() => {
    if (!resource.duration) return 300;
    const match = resource.duration.match(/(\d+)/);
    return match ? parseInt(match[0]) * 60 : 300;
  }, [resource.duration]);

  const [totalDuration, setTotalDuration] = useState(getDurationInSeconds());

  useEffect(() => {
    // Update duration if resource changes
    setTotalDuration(getDurationInSeconds());
    setCurrentTime(0);
    setIsPlaying(true); // Auto-play when opened
  }, [resource, getDurationInSeconds]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  // Calculate progress percentage
  const progress = (currentTime / totalDuration) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipBack = () => {
    setCurrentTime(Math.max(0, currentTime - 15));
  };

  const handleSkipForward = () => {
    setCurrentTime(Math.min(totalDuration, currentTime + 15));
  };

  return (
    // Added 'fixed inset-0 z-50' to make it a full-screen overlay modal
    <div>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-200">
      
      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 p-2 bg-white/50 hover:bg-white/80 backdrop-blur-sm rounded-full transition-colors z-50"
      >
        <X className="w-6 h-6 text-gray-700" />
      </button>

      {/* Decorative floating elements */}
      <div className="absolute top-10 left-10 text-purple-300 text-6xl opacity-30 animate-pulse">✨</div>
      <div className="absolute top-32 right-16 text-pink-300 text-5xl opacity-30 animate-bounce delay-700">🌸</div>
      <div className="absolute bottom-20 left-20 text-blue-300 text-5xl opacity-30 animate-pulse">☁️</div>
      <div className="absolute bottom-32 right-32 text-purple-300 text-4xl opacity-30">✨</div>

      <div className="max-w-md w-full relative z-10">
        {/* Main player card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
          {/* Decorative clouds */}
          <div className="relative mb-8">
            <div className="flex justify-center items-center gap-8 mb-4">
              <div className="text-4xl animate-bounce-slow">☁️</div>
              <div className="text-5xl animate-bounce-slower">☁️</div>
              <div className="text-4xl animate-bounce-slow">☁️</div>
            </div>
            <div className="flex justify-center">
              <div className="text-3xl">☺️</div>
            </div>
          </div>

          {/* Title - NOW DYNAMIC */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2 line-clamp-2">
            {resource.title}
          </h1>
          <p className="text-sm text-gray-600 text-center mb-6 capitalize">
            {resource.duration} • {resource.category}
          </p>

          {/* Action buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button className="bg-gray-100 hover:bg-gray-200 rounded-full p-3 transition-colors">
              <Heart className="w-5 h-5 text-gray-700" />
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 rounded-full p-3 transition-colors">
              <Share2 className="w-5 h-5 text-gray-700" />
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 rounded-full p-3 transition-colors">
              <BookmarkPlus className="w-5 h-5 text-gray-700" />
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 rounded-full p-3 transition-colors">
              <Download className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-2 w-full cursor-pointer group">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gray-900 transition-all duration-300 ease-linear relative"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Time labels */}
          <div className="flex justify-between text-xs text-gray-600 mb-6 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>

          {/* Playback controls */}
          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={handleSkipBack}
              className="hover:bg-gray-100 rounded-full p-2 transition-colors active:scale-95"
            >
              <SkipBack className="w-6 h-6 text-gray-700" fill="currentColor" />
            </button>
            
            <button 
              onClick={togglePlay}
              className="bg-gray-900 hover:bg-gray-800 rounded-full p-5 transition-all transform hover:scale-105 shadow-lg active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" fill="white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              )}
            </button>
            
            <button 
              onClick={handleSkipForward}
              className="hover:bg-gray-100 rounded-full p-2 transition-colors active:scale-95"
            >
              <SkipForward className="w-6 h-6 text-gray-700" fill="currentColor" />
            </button>
          </div>

          {/* Additional info - NOW DYNAMIC */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">About this session</h3>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
              {resource.description}
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};


interface ResourceHubProps {
  recommendedGame?: string | null;
  recommendedVideo?: {id: string, title: string, duration: string} | null;
  onGameClose?: () => void;
  onVideoClose?: () => void;
}

const ResourceHub = ({ recommendedGame, recommendedVideo, onGameClose, onVideoClose }: ResourceHubProps = {}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Modal States
  const [showGame, setShowGame] = useState(false);
  const [showExercise, setShowExercise] = useState(false);
  const [showAudio, setShowAudio] = useState(false); // NEW State for Audio
  
  // Current Item States
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [currentExercise, setCurrentExercise] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<Resource | null>(null); // NEW State for Audio Item
  const [currentVideo, setCurrentVideo] = useState<Resource | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Auto-launch recommended game
  useEffect(() => {
    if (recommendedGame) {
      setCurrentGame(recommendedGame);
      setShowGame(true);
    }
  }, [recommendedGame]);

  // Auto-launch recommended video
  useEffect(() => {
    if (recommendedVideo) {
      const videoResource: Resource = {
        id: recommendedVideo.id,
        title: recommendedVideo.title,
        description: 'Recommended wellness video',
        type: 'video',
        category: 'mindfulness',
        duration: recommendedVideo.duration,
        rating: 5.0,
        downloads: 0,
        url: `https://www.youtube.com/watch?v=${recommendedVideo.id}`
      };
      setCurrentVideo(videoResource);
      setIsVideoModalOpen(true);
    }
  }, [recommendedVideo]);

  // Data
  const resources: Resource[] = [
    {
      id: '1',
      title: 'Managing Exam Anxiety: A Complete Guide',
      description: 'Learn evidence-based techniques to reduce anxiety before and during exams.',
      type: 'guide',
      category: 'anxiety',
      duration: '15 min read',
      rating: 4.8,
      downloads: 1250,
      content: ''
    },
    {
      id: '2',
      title: 'Deep Breathing for Instant Calm',
      description: 'Guided breathing exercises to help you find peace in stressful moments.',
      type: 'audio',
      category: 'stress',
      duration: '10 min',
      rating: 4.9,
      downloads: 2100
    },
    {
      id: '3',
      title: 'Good Habits Vs Bad Habits | Moral Stories for Kids',
      description: 'Here, we are presenting "Good Habits Vs Bad Habits for Kids" by KIDS HUT.',
      type: 'video',
      category: 'anxiety',
      duration: '3 min',
      rating: 4.7,
      downloads: 890,
      url: 'https://www.youtube.com/embed/PiMqc1XzOHs?si=N6Yad1DVOTY56KcP&amp;start=5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin'
    },
    {
      id: '18',
      title: 'Sleep Hygiene for Students',
      description: 'Expert tips on creating healthy sleep habits that work with your schedule.',
      type: 'video',
      category: 'sleep',
      duration: '3.5 min',
      rating: 4.7,
      downloads: 890,
      url: 'https://www.youtube.com/embed/xXGnjtLyUiI?si=NKijb3U-V2oo_JOw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin' 
    },
    {
      id: '19',
      title: 'What Is Depression? || Depression Causes And Symptoms',
      description: 'What Is Depression? | Depression Causes And Symptoms | What Is Depression For Students | Depression Symptoms | Depression Simple Definition | What To Do When Someone Is In Depression .',
      type: 'video',
      category: 'depression',
      duration: '6 min',
      rating: 4.7,
      downloads: 890,
      url: 'https://youtu.be/0hxFR6tezAc?si=aeHEL0l6waNxgca7'
    },
    {
      id: '4',
      title: '5 Mindful Study Techniques',
      description: 'Combine mindfulness with studying for better focus and retention.',
      type: 'article',
      category: 'academic',
      duration: '8 min read',
      rating: 4.6,
      downloads: 1560,
      content: ''
    },
    {
      id: '5',
      title: 'Progressive Muscle Relaxation',
      description: 'A guided session to release physical tension and mental stress.',
      type: 'audio',
      category: 'mindfulness',
      duration: '20 min',
      rating: 4.9,
      downloads: 1780
    },
    {
      id: '6',
      title: 'Recognizing Depression Warning Signs',
      description: 'Understanding the symptoms and when to seek professional help.',
      type: 'guide',
      category: 'depression',
      duration: '12 min read',
      rating: 4.8,
      downloads: 945,
      content: '',
    },
    {
      id: '7',
      title: '4-7-8 Breathing Technique',
      description: 'Master the 4-7-8 breathing method to reduce anxiety and promote relaxation in minutes.',
      type: 'exercise',
      category: 'breathing',
      duration: '5 min',
      rating: 4.9,
      downloads: 3200,
      url: '4-7-8-breathing'
    },
    {
      id: '9',
      title: 'Breath Awareness Meditation',
      description: 'Simple yet powerful meditation focusing on natural breathing patterns.',
      type: 'exercise',
      category: 'breathing',
      duration: '10 min',
      rating: 4.7,
      downloads: 2400,
      url: 'breath-awareness'
    },
    {
      id: '10',
      title: 'Interactive Breathing Ball',
      description: 'Follow the expanding and contracting ball to regulate your breathing and find calm.',
      type: 'game',
      category: 'games',
      duration: '2-5 min',
      rating: 4.9,
      downloads: 5600,
      url: 'breathing-ball'
    },
    {
      id: '11',
      title: 'Calm Circle - Breath Pacer',
      description: 'Visual breathing pacer with customizable timing to help you destress instantly.',
      type: 'game',
      category: 'games',
      duration: 'Flexible',
      rating: 4.8,
      downloads: 4200,
      url: 'calm-circle'
    },
    {
      id: '12',
      title: 'Box Breathing Exercise',
      description: 'Navy SEAL technique with visual guidance - follow the box pattern for stress relief.',
      type: 'game',
      category: 'games',
      duration: '5-15 min',
      rating: 4.7,
      downloads: 3800,
      url: 'box-breathing'
    },
    {
      id: '13',
      title: 'Morning Energizer Breathing',
      description: 'Wake up your body and mind with this invigorating breathing sequence.',
      type: 'exercise',
      category: 'breathing',
      duration: '6 min',
      rating: 4.6,
      downloads: 1900,
      url: 'morning-energizer'
    },
    {
      id: '14',
      title: 'Anxiety Release Breathing',
      description: 'Specially designed breathing pattern to quickly calm anxiety and racing thoughts.',
      type: 'exercise',
      category: 'breathing',
      duration: '7 min',
      rating: 4.9,
      downloads: 3500,
      url: 'anxiety-release'
    },
    {
      id: '15',
      title: 'Zen Water Ripple',
      description: 'Create calming water ripples with each tap. Visual ASMR effect for instant relaxation.',
      type: 'game',
      category: 'games',
      duration: 'Unlimited',
      rating: 4.9,
      downloads: 6200,
      url: 'zen-water-ripple'
    },
    {
      id: '16',
      title: 'Mandala Color Therapy',
      description: 'Fill mandala sections with calming colors. Color therapy meets pattern recognition.',
      type: 'game',
      category: 'games',
      duration: '10-15 min',
      rating: 4.8,
      downloads: 5400,
      url: 'mandala-color-picker'
    },
    {
      id: '17',
      title: 'Falling Leaves Grounding',
      description: 'Drag autumn leaves into a basket. Grounding technique with slow deliberate movements.',
      type: 'game',
      category: 'games',
      duration: '5-10 min',
      rating: 4.7,
      downloads: 4800,
      url: 'falling-leaves'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Resources', icon: BookOpen },
    { id: 'breathing', label: 'Breathing', icon: Wind },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'anxiety', label: 'Anxiety', icon: Brain },
    { id: 'depression', label: 'Depression', icon: Heart },
    { id: 'stress', label: 'Stress', icon: Activity },
    { id: 'sleep', label: 'Sleep', icon: Brain },
    { id: 'mindfulness', label: 'Mindfulness', icon: Heart },
    { id: 'academic', label: 'Academic', icon: BookOpen }
  ];

  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'video': return Video;
      case 'audio': return Headphones;
      case 'article': return FileText;
      case 'guide': return BookOpen;
      case 'exercise': return Wind;
      case 'game': return Gamepad2;
      default: return BookOpen;
    }
  };

  const getResourceColor = (type: Resource['type']) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800';
      case 'audio': return 'bg-purple-100 text-purple-800';
      case 'article': return 'bg-blue-100 text-blue-800';
      case 'guide': return 'bg-green-100 text-green-800';
      case 'exercise': return 'bg-teal-100 text-teal-800';
      case 'game': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleResourceClick = (resource: Resource) => {
    // 1. Games Logic
    if (resource.type === 'game' && resource.url) {
      if (['breathing-ball', 'calm-circle', 'box-breathing', 'zen-water-ripple', 'mandala-color-picker', 'falling-leaves'].includes(resource.url)) {
        setCurrentGame(resource.url);
        setShowGame(true);
      } else {
        window.open(resource.url, '_blank');
      }
      return;
    } 
    
    // 2. Navigation for Article/Guide
    if (resource.type === 'guide' || resource.type === 'article') {
      const newPath = `/artical/${resource.id}`;
      router.push(newPath);
      return;
    }

    // 3. Audio Logic (UPDATED: Open Modal instead of Push)
    if (resource.type === 'audio') {
      setCurrentAudio(resource);
      setShowAudio(true);
      return;
    }
    
    // 4. Video Logic
    if (resource.type === 'video') {
      setCurrentVideo(resource);
      setIsVideoModalOpen(true);
      return;
    } 
    
    // 5. Exercise Logic
    if (resource.type === 'exercise' && resource.url) {
        setCurrentExercise(resource.url);
        setShowExercise(true);
        return;
    } 
    
    // Fallback
    if (resource.url) {
      window.open(resource.url, '_blank');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl sm:text-2xl font-heading">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-secondary animate-pulse-soft" />
            Wellness Resource Hub
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm font-body">
            Access curated mental health resources, guided meditations, breathing exercises, and calming games designed for students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm sm:text-base font-body"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
            <TabsList className="flex flex-wrap gap-2 h-auto p-2 bg-muted rounded-lg">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="text-xs sm:text-sm py-2 px-3 flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <category.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{category.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredResources.map((resource) => {
              const ResourceIcon = getResourceIcon(resource.type);
              
              return (
                <Card
                  key={resource.id}
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                  onClick={() => handleResourceClick(resource)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={`${getResourceColor(resource.type)} text-xs`}>
                        <ResourceIcon className="w-3 h-3 mr-1" />
                        {resource.type}
                      </Badge>
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 mr-1 fill-yellow-500" />
                        {resource.rating}
                      </div>
                    </div>
                    <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors line-clamp-2 font-heading">
                      {resource.title}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm line-clamp-2 font-body">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="truncate">{resource.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span>{resource.downloads > 1000 ? `${(resource.downloads / 1000).toFixed(1)}k` : resource.downloads}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 text-xs sm:text-sm font-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResourceClick(resource);
                        }}
                      >
                         {resource.type === 'video' ? (
                          <>
                            <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Watch
                          </>
                        ) : resource.type === 'audio' ? (
                          <>
                            <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Play
                          </>
                        ) : resource.type === 'exercise' ? (
                          <>
                            <Wind className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Start
                          </>
                        ) : resource.type === 'game' ? (
                          <>
                            <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Play
                          </>
                        ) : (
                          <>
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Read
                          </>
                        )}
                      </Button>
                      
                      {(resource.type === 'article' || resource.type === 'guide') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const element = document.createElement("a");
                            const contentToDownload = resource.content || resource.description;
                            const file = new Blob([contentToDownload], {type: 'text/html'});
                            element.href = URL.createObjectURL(file);
                            element.download = `${resource.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_PRD.html`;
                            document.body.appendChild(element); 
                            element.click();
                            document.body.removeChild(element);
                          }}
                        >
                          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No resources found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Featured Collections Section - (Kept same as original) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl font-heading">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-500 fill-yellow-500" />
            Featured Collections
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm font-body">
            Curated resource collections for common student challenges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-teal-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Wind className="w-8 h-8 text-teal-600" />
                  <Badge className="bg-teal-600 text-white text-xs">New</Badge>
                </div>
                <h3 className="font-semibold text-teal-800 mb-2 text-sm sm:text-base font-heading">
                  Breathing Exercises
                </h3>
                <p className="text-xs sm:text-sm text-teal-700 mb-3 font-body">
                  Master various breathing techniques to instantly calm anxiety and improve focus.
                </p>
                <div className="flex items-center text-xs sm:text-sm text-teal-700 font-medium">
                  <Wind className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  5 Exercises
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Gamepad2 className="w-8 h-8 text-orange-600" />
                  <Badge className="bg-orange-600 text-white text-xs">Popular</Badge>
                </div>
                <h3 className="font-semibold text-orange-800 mb-2 text-sm sm:text-base font-heading">
                  Interactive Games
                </h3>
                <p className="text-xs sm:text-sm text-orange-700 mb-3 font-body">
                  Play calming, interactive games designed to reduce stress and improve mental wellness.
                </p>
                <div className="flex items-center text-xs sm:text-sm text-orange-700 font-medium">
                  <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  6 Games
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-100 to-slate-200 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-slate-300">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <FileText className="w-8 h-8 text-slate-600" />
                  <Badge className="bg-slate-600 text-white text-xs">Essential</Badge>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base font-heading">
                  Exam Preparation Toolkit
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 mb-3 font-body">
                  Complete guide to managing exam stress, study techniques, and maintaining mental health during tests.
                </p>
                <div className="flex items-center text-xs sm:text-sm text-slate-700 font-medium">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  8 Resources
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-indigo-200 sm:col-span-2 lg:col-span-1">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Headphones className="w-8 h-8 text-indigo-600" />
                  <Badge className="bg-indigo-600 text-white text-xs">Trending</Badge>
                </div>
                <h3 className="font-semibold text-indigo-800 mb-2 text-sm sm:text-base font-heading">
                  Sleep & Recovery
                </h3>
                <p className="text-xs sm:text-sm text-indigo-700 mb-3 font-body">
                  Everything you need to establish healthy sleep patterns and recover from academic burnout.
                </p>
                <div className="flex items-center text-xs sm:text-sm text-indigo-700 font-medium">
                  <Headphones className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  6 Resources
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* --- MODALS SECTION --- */}
      
      {/* 1. GAME MODALS (Wrapped in FullScreenModalWrapper) */}
      {showGame && (
        <FullScreenModalWrapper>
          {currentGame === 'breathing-ball' && <BreathingBall onClose={() => { setShowGame(false); onGameClose?.(); }} />}
          {currentGame === 'calm-circle' && <CalmCircle onClose={() => { setShowGame(false); onGameClose?.(); }} />}
          {currentGame === 'box-breathing' && <BoxBreathing onClose={() => { setShowGame(false); onGameClose?.(); }} />}
          {currentGame === 'zen-water-ripple' && <ZenWaterRipple onClose={() => { setShowGame(false); onGameClose?.(); }} />}
          {currentGame === 'mandala-coloring' && <MandalaColorPicker onClose={() => { setShowGame(false); onGameClose?.(); }} />}
          {currentGame === 'falling-leaves' && <FallingLeavesGrounding onClose={() => { setShowGame(false); onGameClose?.(); }} />}
        </FullScreenModalWrapper>
      )}

      {/* 2. EXERCISE MODALS (Wrapped in FullScreenModalWrapper) */}
      {showExercise && (
         <FullScreenModalWrapper>
        <div className="flex items-center justify-center w-full min-h-full">
          {currentExercise === '4-7-8-breathing' && <FourSevenEightBreathing onClose={() => setShowExercise(false)} />}
          {currentExercise === 'breath-awareness' && <BreathAwareness onClose={() => setShowExercise(false)} />}
          {currentExercise === 'morning-energizer' && <MorningEnergizer onClose={() => setShowExercise(false)} />}
          {currentExercise === 'anxiety-release' && <AnxietyRelease onClose={() => setShowExercise(false)} />}
        </div>
        </FullScreenModalWrapper>
      )}
      
      {/* 3. AUDIO MODAL (New) */}
      {showAudio && currentAudio && (
        <AudioResourceModal 
          resource={currentAudio} 
          onClose={() => {
            setShowAudio(false);
            setCurrentAudio(null);
          }} 
        />
      )}

      {/* 4. VIDEO MODAL (Existing) */}
      {isVideoModalOpen && currentVideo && (
        <VideoResourceModal
          resource={currentVideo}
          onClose={() => {
            setIsVideoModalOpen(false);
            onVideoClose?.();
          }}
        />
      )}
    </div>
  );
};

export default ResourceHub;