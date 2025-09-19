"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Video
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'article' | 'guide';
  category: 'anxiety' | 'depression' | 'stress' | 'sleep' | 'mindfulness' | 'academic';
  duration?: string;
  rating: number;
  downloads: number;
  thumbnail?: string;
}

const ResourceHub = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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
    }
  ];

  const categories = [
    { id: 'all', label: 'All Resources', icon: BookOpen },
    { id: 'anxiety', label: 'Anxiety', icon: Brain },
    { id: 'depression', label: 'Depression', icon: Heart },
    { id: 'stress', label: 'Stress', icon: Brain },
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
      default: return BookOpen;
    }
  };

  const getResourceColor = (type: Resource['type']) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800';
      case 'audio': return 'bg-purple-100 text-purple-800';
      case 'article': return 'bg-blue-100 text-blue-800';
      case 'guide': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <BookOpen className="w-6 h-6 mr-3 text-secondary animate-pulse-soft" />
            Wellness Resource Hub
          </CardTitle>
          <CardDescription>
            Access curated mental health resources, guided meditations, and expert content designed for students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
            <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  <category.icon className="w-3 h-3 mr-1" />
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const ResourceIcon = getResourceIcon(resource.type);
              return (
                <Card key={resource.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge className={`${getResourceColor(resource.type)} mb-2`}>
                        <ResourceIcon className="w-3 h-3 mr-1" />
                        {resource.type}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="w-3 h-3 text-yellow-500 mr-1" />
                        {resource.rating}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {resource.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {resource.duration}
                      </div>
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {resource.downloads}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-gradient-to-r from-primary to-support hover:from-primary/90 hover:to-support/90">
                        {resource.type === 'video' ? (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Watch
                          </>
                        ) : resource.type === 'audio' ? (
                          <>
                            <Volume2 className="w-4 h-4 mr-1" />
                            Listen
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-1" />
                            Read
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
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
          <CardTitle className="flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Featured Collections
          </CardTitle>
          <CardDescription>Curated resource collections for common student challenges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-r from-wellness/10 to-wellness-light cursor-pointer hover:shadow-md transition-all">
              <CardContent className="p-4">
                <h3 className="font-semibold text-wellness mb-2">Exam Preparation Toolkit</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Complete guide to managing exam stress, study techniques, and maintaining mental health during tests.
                </p>
                <div className="flex items-center text-sm text-wellness">
                  <FileText className="w-4 h-4 mr-1" />
                  8 Resources
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-support/10 to-support-light cursor-pointer hover:shadow-md transition-all">
              <CardContent className="p-4">
                <h3 className="font-semibold text-support mb-2">Sleep & Recovery</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Everything you need to establish healthy sleep patterns and recover from academic burnout.
                </p>
                <div className="flex items-center text-sm text-support">
                  <Headphones className="w-4 h-4 mr-1" />
                  6 Resources
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceHub;