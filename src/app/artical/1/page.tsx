import React from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArticleNavigation } from '@/components/articles/ArticleNavigation';

export default function ExamAnxietyGuide() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with Hero Image */}
      <div className="relative">
        <div className="relative w-full h-64 sm:h-80 bg-gradient-to-br from-purple-100 to-purple-200 overflow-hidden">
          <Image 
            src="https://images.pexels.com/photos/8278873/pexels-photo-8278873.jpeg" 
            alt="Managing exam anxiety"
            fill
            className="w-full h-full object-cover opacity-90"
          />
        
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
        </div>

        {/* Top Navigation Bar - Client Component */}
        <ArticleNavigation />
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          How to be mindful
        </h1>
        
        {/* Author */}
        <p className="text-sm text-muted-foreground mb-3">
          by Apple Mehmud
        </p>
        
        {/* Meta Info */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
          <span>8-10 min</span>
          <span>⭐</span>
          <span>4.7</span>
          <span className="text-xs">| 167k View</span>
        </div>

        {/* Introduction */}
        <p className="text-base text-foreground leading-relaxed mb-6">
          Being mindful requires intentional focus. To become more mindful, it is necessary to learn how to be mindful in the here and now. Here are some tips:
        </p>

        {/* Tips List */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">•</span>
            <p className="text-base text-foreground leading-relaxed">
              Take five minutes each day to sit and observe your breath.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">•</span>
            <p className="text-base text-foreground leading-relaxed">
              Let go of expectations and embrace the present moment.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">•</span>
            <p className="text-base text-foreground leading-relaxed">
              If a thought or emotion arises, focus on it, but dont judge or act upon it.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">•</span>
            <p className="text-base text-foreground leading-relaxed">
              Try body scanning from head to toe, like a wave passing through your system.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">•</span>
            <p className="text-base text-foreground leading-relaxed">
              Engage fully in your daily activities, whether its eating, walking, or talking.
            </p>
          </div>
        </div>

        {/* Additional Content */}
        <p className="text-base text-foreground leading-relaxed mb-4">
          Mindfulness is about being present in each moment without judgment. By practicing these techniques regularly, you can develop a deeper awareness of your thoughts, emotions, and physical sensations.
        </p>

        <p className="text-base text-foreground leading-relaxed">
          Remember, mindfulness is a skill that takes time to develop. Be patient with yourself and celebrate small progress along the way.
        </p>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <Button 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6 rounded-xl flex items-center justify-center gap-2 text-base font-semibold"
            size="lg"
          >
            <Play className="w-5 h-5 fill-white" />
            Start Session
          </Button>
        </div>
      </div>
    </div>
  );
}