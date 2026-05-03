import React from 'react';
import Image from 'next/image';
import { Play, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArticleNavigation } from '@/components/articles/ArticleNavigation';

export default function DepressionWarningGuide() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with Hero Image */}
      <div className="relative">
        {/* Hero Image */}
        <div className="relative w-full h-64 sm:h-80 bg-gradient-to-br from-slate-100 to-blue-200 overflow-hidden">
          <Image 
            src="https://images.pexels.com/photos/3807738/pexels-photo-3807738.jpeg" 
            alt="Understanding depression"
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
          Recognizing Depression Warning Signs
        </h1>
        
        {/* Author */}
        <p className="text-sm text-muted-foreground mb-3">
          by Dr. Michael Chen
        </p>
        
        {/* Meta Info */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
          <span>12 min</span>
          <span>⭐</span>
          <span>4.8</span>
          <span className="text-xs">| 94k View</span>
        </div>

        {/* Introduction */}
        <p className="text-base text-foreground leading-relaxed mb-6">
          Understanding the symptoms and when to seek professional help is crucial for mental health. Here are the key warning signs to watch for:
        </p>

        {/* Warning Signs */}
        <div className="space-y-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Persistent Sadness or Emptiness</h2>
            <p className="text-base text-foreground leading-relaxed">
              While not everyone with depression feels constantly sad, many experience a lingering sense of emptiness or hopelessness that doesn't seem to go away. This emotional heaviness may last for weeks or even months.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Loss of Interest in Activities</h2>
            <p className="text-base text-foreground leading-relaxed">
              One of the major red flags is losing interest in things you normally enjoy — hobbies, friends, music, or even food. This condition, known as anhedonia, often signals deeper emotional distress.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Sleep Disturbances</h2>
            <p className="text-base text-foreground leading-relaxed">
              Depression can disrupt sleep patterns in two ways: insomnia (difficulty sleeping) or hypersomnia (sleeping too much). Both can worsen fatigue and make daily tasks feel overwhelming.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Changes in Appetite or Weight</h2>
            <p className="text-base text-foreground leading-relaxed">
              Some people may lose their appetite, while others may overeat as a coping mechanism. Noticeable weight loss or gain over a short period can be a sign of emotional imbalance.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Difficulty Concentrating</h2>
            <p className="text-base text-foreground leading-relaxed">
              Depression affects cognitive functions, making it hard to focus, make decisions, or remember things. This is sometimes described as "brain fog."
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Physical Symptoms</h2>
            <p className="text-base text-foreground leading-relaxed">
              Depression doesn't only affect the mind. Many people experience headaches, stomach pain, fatigue, or general aches with no clear physical cause.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Irritability or Mood Swings</h2>
            <p className="text-base text-foreground leading-relaxed">
              While depression is often portrayed as sadness, irritability is also common — especially among teens and young adults. Small inconveniences may suddenly feel overwhelming or infuriating.
            </p>
          </div>
        </div>

        {/* When to Seek Help */}
        <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-6 border-l-4 border-red-500 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">When to Seek Professional Help</h2>
          <p className="text-base text-foreground leading-relaxed mb-3">
            If you experience several of these symptoms for more than two weeks, it's important to reach out to a mental health professional.
          </p>
          <p className="text-base text-foreground leading-relaxed font-semibold">
            If you're having thoughts of self-harm or suicide, please seek immediate help by contacting a crisis helpline or emergency services.
          </p>
        </div>

        {/* Conclusion */}
        <p className="text-base text-foreground leading-relaxed">
          Remember: Seeking help is a sign of strength, not weakness. Depression is treatable, and with proper support, recovery is possible. You don't have to face this alone.
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
