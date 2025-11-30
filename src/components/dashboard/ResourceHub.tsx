"use client";

import { useState, useEffect } from "react";
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
  Activity
} from "lucide-react";
import BreathingBall from "./games/BreathingBall";
import BoxBreathing from "./games/BoxBreathing";
import CalmCircle from "./games/CalmCircle";
import ZenWaterRipple from "./games/ZenWaterRipple";
import MandalaColorPicker from "./games/MandalaColorPicker";
import FallingLeavesGrounding from "./games/FallingLeavesGrounding";

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
}

const ResourceHub = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showGame, setShowGame] = useState(false);
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  // Listen for exercise launch events from chatbot
  useEffect(() => {
    const handleLaunchExercise = (event: CustomEvent) => {
      const { exerciseId } = event.detail;
      if (exerciseId) {
        setCurrentGame(exerciseId);
        setShowGame(true);
      }
    };

    window.addEventListener('resource:launch-exercise' as any, handleLaunchExercise);
    return () => {
      window.removeEventListener('resource:launch-exercise' as any, handleLaunchExercise);
    };
  }, []);

  const resources: Resource[] = [
    {
      id: '1',
      title: 'Managing Exam Anxiety: A Complete Guide',
      description: 'Learn evidence-based techniques to reduce anxiety before and during exams.',
      type: 'guide',
      category: 'anxiety',
      duration: '15 min read',
      rating: 4.8,
      downloads: 1250
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
      title: 'Sleep Hygiene for Students',
      description: 'Expert tips on creating healthy sleep habits that work with your schedule.',
      type: 'video',
      category: 'sleep',
      duration: '12 min',
      rating: 4.7,
      downloads: 890
    },
    {
      id: '4',
      title: 'Mindful Study Techniques',
      description: 'Combine mindfulness with studying for better focus and retention.',
      type: 'article',
      category: 'academic',
      duration: '8 min read',
      rating: 4.6,
      downloads: 1560
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
      downloads: 945
    },
    {
      id: '7',
      title: '4-7-8 Breathing Technique',
      description: 'Master the 4-7-8 breathing method to reduce anxiety and promote relaxation in minutes.',
      type: 'exercise',
      category: 'breathing',
      duration: '5 min',
      rating: 4.9,
      downloads: 3200
    },
    {
      id: '8',
      title: 'Box Breathing Exercise',
      description: 'Navy SEAL technique for stress relief - breathe in rhythm with visual guidance.',
      type: 'exercise',
      category: 'breathing',
      duration: '8 min',
      rating: 4.8,
      downloads: 2800
    },
    {
      id: '9',
      title: 'Breath Awareness Meditation',
      description: 'Simple yet powerful meditation focusing on natural breathing patterns.',
      type: 'exercise',
      category: 'breathing',
      duration: '10 min',
      rating: 4.7,
      downloads: 2400
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
      downloads: 1900
    },
    {
      id: '14',
      title: 'Anxiety Release Breathing',
      description: 'Specially designed breathing pattern to quickly calm anxiety and racing thoughts.',
      type: 'exercise',
      category: 'breathing',
      duration: '7 min',
      rating: 4.9,
      downloads: 3500
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
      // Check if it's an internal game
      if (resource.url === 'breathing-ball') {
        setCurrentGame('breathing-ball');
        setShowGame(true);
      } else if (resource.url === 'calm-circle') {
        setCurrentGame('calm-circle');
        setShowGame(true);
      } else if (resource.url === 'box-breathing') {
        setCurrentGame('box-breathing');
        setShowGame(true);
      } else if (resource.url === 'zen-water-ripple') {
        setCurrentGame('zen-water-ripple');
        setShowGame(true);
      } else if (resource.url === 'mandala-color-picker') {
        setCurrentGame('mandala-color-picker');
        setShowGame(true);
      } else if (resource.url === 'falling-leaves') {
        setCurrentGame('falling-leaves');
        setShowGame(true);
      } else {
        // External URL
        window.open(resource.url, '_blank');
      }
    } else {
      // Handle other resource types
      console.log('Opening resource:', resource.title);
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
                            Listen
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
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
    </div>
  );
};

export default ResourceHub;