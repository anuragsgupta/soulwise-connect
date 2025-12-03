"use client";

import { useState, useEffect } from "react";
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
  X, // Added for closing the modal
  ExternalLink // Added for external link icon
} from "lucide-react";

// Game Imports
import BreathingBall from "./games/BreathingBall";
import BoxBreathing from "./games/BoxBreathing";
import CalmCircle from "./games/CalmCircle";
import ZenWaterRipple from "./games/ZenWaterRipple";
import MandalaColorPicker from "./games/MandalaColorPicker";
import FallingLeavesGrounding from "./games/FallingLeavesGrounding";

// --- NEW EXERCISE IMPORTS ---
import FourSevenEightBreathing from "./exercises/FourSevenEightBreathing";
import BreathAwareness from "./exercises/BreathAwareness";
import MorningEnergizer from "./exercises/MorningEnergizer";
import AnxietyRelease from "./exercises/AnxietyRelease";

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
  content?: string; // Added for modal content
}

// --- NEW COMPONENT: ResourceModal (For Articles/Guides) ---
interface ResourceModalProps {
  resource: Resource;
  onClose: () => void;
}


// --- NEW COMPONENT: VideoResourceModal (For YouTube Videos) ---
interface VideoModalProps {
  resource: Resource;
  onClose: () => void;
}

const VideoResourceModal = ({ resource, onClose }: VideoModalProps) => {
  // Helper to get embed URL from standard YouTube link
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl bg-background shadow-xl">
        <CardHeader className="flex flex-row items-start justify-between border-b p-4 sm:p-6">
          <div className="space-y-1 pr-6">
            <CardTitle className="text-xl sm:text-2xl font-heading flex items-center">
              <Video className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-red-600" />
              {resource.title}
            </CardTitle>
            <CardDescription className="text-sm">
                 Category: <Badge variant="outline" className="text-xs mt-2">{resource.category}</Badge> | Type: <Badge variant="outline" className="text-xs">{resource.type}</Badge>
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {/* Responsive Video Container (16:9 Aspect Ratio) */}
          <div className="relative w-full pt-[56.25%] bg-black">
            {embedUrl ? (
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={embedUrl}
                title={resource.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white">
                <p>Video URL not found</p>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-muted-foreground">{resource.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
// --- END NEW COMPONENT ---


const ResourceHub = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showGame, setShowGame] = useState(false);
  const [showExercise, setShowExercise] = useState(false);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [currentExercise, setCurrentExercise] = useState<string | null>(null);

  // New state for video modal (kept as video logic is unchanged)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Resource | null>(null);

  // Audio playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioTimer, setAudioTimer] = useState(0);
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Helper function for audio timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start fake audio playback
  const startFakePlayback = (resource: Resource) => {
    // Stop any currently playing audio
    if (timerIntervalId) clearInterval(timerIntervalId);
    
    setPlayingAudioId(resource.id);
    setAudioTimer(0);
    
    const interval = setInterval(() => {
      setAudioTimer(prev => prev + 1);
    }, 1000);
    
    setTimerIntervalId(interval);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalId) clearInterval(timerIntervalId);
    };
  }, [timerIntervalId]);

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
      url: 'https://www.youtube.com/embed/PiMqc1XzOHs?si=N6Yad1DVOTY56KcP&amp;start=5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin' // Added Sample YouTube URL
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
      url: 'https://www.youtube.com/embed/xXGnjtLyUiI?si=NKijb3U-V2oo_JOw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin' // Added Sample YouTube URL
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
      url: 'https://youtu.be/0hxFR6tezAc?si=aeHEL0l6waNxgca7' // Added Sample YouTube URL
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
      url: '4-7-8-breathing' // Added URL for exercise
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
      url: 'breath-awareness' // Added URL for exercise
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
      url: 'morning-energizer' // Added URL for exercise
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
      url: 'anxiety-release' // Added URL for exercise
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
    if (resource.type === 'game' && resource.url) {
      // Internal Games
      if (['breathing-ball', 'calm-circle', 'box-breathing', 'zen-water-ripple', 'mandala-color-picker', 'falling-leaves'].includes(resource.url)) {
        setCurrentGame(resource.url);
        setShowGame(true);
      } else {
        // External URL for game
        window.open(resource.url, '_blank');
      }
      return;
    } 
    
    if (resource.type === 'guide' || resource.type === 'article') {
      // If "artical" folder is in the SAME route segment as this page:
      const newPath = `/artical/${resource.id}`;   // or just `artical/${resource.id}`

      console.log(`Navigating to the clean resource path: ${newPath}`);
      router.push(newPath);
      return;
    }

    
    // *** NEW LOGIC: Audio now starts or stops a fake timer ***
    if (resource.type === 'audio') {
      if (playingAudioId === resource.id) {
        // Stop playback if already playing
        if (timerIntervalId) clearInterval(timerIntervalId);
        setPlayingAudioId(null);
        setTimerIntervalId(null);
        setAudioTimer(0);
      } else {
        startFakePlayback(resource);
      }
      return;
    }
    
    // Video logic remains the same
    if (resource.type === 'video') {
      // Open Video Modal
      setCurrentVideo(resource);
      setIsVideoModalOpen(true);
      return;
    } 
    
    // Exercise logic remains the same
    if (resource.type === 'exercise' && resource.url) {
        // --- Handle Exercise Modal ---
        setCurrentExercise(resource.url);
        setShowExercise(true);
        return;
    } 
    
    // Fallback for other resource types (Audio, or Exercises without URL, which are handled above now)
    console.log(`Opening external resource: ${resource.title}`);
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
              const isPlaying = resource.type === 'audio' && playingAudioId === resource.id;
              
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
                        {/* *** MODIFIED AUDIO/PLAY BUTTON LOGIC *** */}
                        {isPlaying ? (
                          <>
                            <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-300 animate-pulse" />
                            Playing: {formatTime(audioTimer)}
                          </>
                        ) : resource.type === 'video' ? (
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
                      
                      {/* MODIFIED: Download button only for articles and guides */}
                      {(resource.type === 'article' || resource.type === 'guide') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Create a blob to download the PRD content
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

      {/* Featured Collections */}
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

            <Card className="bg-gradient-to-br from-wellness/20 to-wellness-light cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-wellness/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <FileText className="w-8 h-8 text-wellness" />
                  <Badge className="bg-wellness text-white text-xs">Essential</Badge>
                </div>
                <h3 className="font-semibold text-wellness-foreground mb-2 text-sm sm:text-base font-heading">
                  Exam Preparation Toolkit
                </h3>
                <p className="text-xs sm:text-sm text-wellness-foreground/80 mb-3 font-body">
                  Complete guide to managing exam stress, study techniques, and maintaining mental health during tests.
                </p>
                <div className="flex items-center text-xs sm:text-sm text-wellness-foreground/80 font-medium">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  8 Resources
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-support/20 to-support-light cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-support/30 sm:col-span-2 lg:col-span-1">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Headphones className="w-8 h-8 text-support" />
                  <Badge className="bg-support text-white text-xs">Trending</Badge>
                </div>
                <h3 className="font-semibold text-support-foreground mb-2 text-sm sm:text-base font-heading">
                  Sleep & Recovery
                </h3>
                <p className="text-xs sm:text-sm text-support-foreground/80 mb-3 font-body">
                  Everything you need to establish healthy sleep patterns and recover from academic burnout.
                </p>
                <div className="flex items-center text-xs sm:text-sm text-support-foreground/80 font-medium">
                  <Headphones className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  6 Resources
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Game Modals */}
      {showGame && currentGame === 'breathing-ball' && (
        <BreathingBall onClose={() => setShowGame(false)} />
      )}
      {showGame && currentGame === 'calm-circle' && (
        <CalmCircle onClose={() => setShowGame(false)} />
      )}
      {showGame && currentGame === 'box-breathing' && (
        <BoxBreathing onClose={() => setShowGame(false)} />
      )}
      {showGame && currentGame === 'zen-water-ripple' && (
        <ZenWaterRipple onClose={() => setShowGame(false)} />
      )}
      {showGame && currentGame === 'mandala-color-picker' && (
        <MandalaColorPicker onClose={() => setShowGame(false)} />
      )}
      {showGame && currentGame === 'falling-leaves' && (
        <FallingLeavesGrounding onClose={() => setShowGame(false)} />
      )}

      {/* Article/Guide Modal: Removed state handling, but keeping definition in case it is used elsewhere */}
      {/* The modal rendering block is removed because 'guide' and 'article' no longer open a modal. */}
      
      {/* Video Modal */}
      {isVideoModalOpen && currentVideo && (
        <VideoResourceModal
          resource={currentVideo}
          onClose={() => setIsVideoModalOpen(false)}
        />
      )}

      {/* --- NEW: Exercise Modals --- */}
      {showExercise && currentExercise === '4-7-8-breathing' && (
        <FourSevenEightBreathing onClose={() => setShowExercise(false)} />
      )}
      {showExercise && currentExercise === 'breath-awareness' && (
        <BreathAwareness onClose={() => setShowExercise(false)} />
      )}
      {showExercise && currentExercise === 'morning-energizer' && (
        <MorningEnergizer onClose={() => setShowExercise(false)} />
      )}
      {showExercise && currentExercise === 'anxiety-release' && (
        <AnxietyRelease onClose={() => setShowExercise(false)} />
      )}
    </div>
  );
};

export default ResourceHub;