import React from 'react';
import Image from 'next/image';
import { Star, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArticleNavigation } from '@/components/articles/ArticleNavigation';

export default function MindfulStudyGuide() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with Hero Image */}
      <div className="relative">
        {/* Hero Image */}
        <div className="relative w-full h-64 sm:h-80 bg-gradient-to-br from-indigo-100 to-purple-200 overflow-hidden">
          <Image 
            src="https://images.pexels.com/photos/3740397/pexels-photo-3740397.jpeg" 
            alt="Mindful study techniques"
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
          5 Mindful Study Techniques
        </h1>
        
        {/* Author */}
        <p className="text-sm text-muted-foreground mb-3">
          by Sarah Johnson
        </p>
        
        {/* Meta Info */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
          <span>8 min</span>
          <span>⭐</span>
          <span>4.6</span>
          <span className="text-xs">| 156k View</span>
        </div>

        {/* Introduction */}
        <p className="text-base text-foreground leading-relaxed mb-6">
          Combine mindfulness with studying for better focus and retention. These evidence-based techniques will help you study smarter, not harder.
        </p>

        {/* Technique 1 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">1. Deep Breathing Before Studying</h2>
          <p className="text-base text-foreground leading-relaxed mb-3">
            Before opening your books, spend just 1–2 minutes taking slow, deep breaths. This reduces stress hormones and increases oxygen flow to the brain, helping you start your study session with clarity.
          </p>
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border-l-4 border-blue-500">
            <p className="text-sm text-foreground italic">
              Studies show that even short breathing exercises can improve focus, memory, and emotional regulation — all crucial for effective studying.
            </p>
          </div>
        </div>

        {/* Technique 2 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">2. The "Single-Task Focus" Method</h2>
          <p className="text-base text-foreground leading-relaxed mb-3">
            Multitasking is one of the biggest enemies of productivity. Mindful studying encourages doing just one task at a time — no switching tabs, no checking notifications, and no background distractions.
          </p>
          <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 border-l-4 border-purple-500">
            <p className="text-sm text-foreground italic">
              When your mind stays fully engaged with a task, your brain strengthens its neural connections, which helps with long-term retention.
            </p>
          </div>
        </div>

        {/* Technique 3 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">3. The 5-Minute Awareness Reset</h2>
          <p className="text-base text-foreground leading-relaxed mb-3">
            If you feel stuck or mentally drained while studying, take a short "awareness reset." Close your eyes and pay attention to your breathing, sounds, or sensations for five minutes.
          </p>
          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border-l-4 border-green-500">
            <p className="text-sm text-foreground italic">
              This helps clear mental clutter and improves your learning efficiency when you return.
            </p>
          </div>
        </div>

        {/* Technique 4 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">4. Mindful Note-Taking</h2>
          <p className="text-base text-foreground leading-relaxed mb-3">
            Instead of copying everything in front of you, mindful note-taking encourages processing the information intentionally. You summarize concepts in your own words, create smaller chunks, or draw quick diagrams.
          </p>
          <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-4 border-l-4 border-orange-500">
            <p className="text-sm text-foreground italic">
              This approach makes your brain engage deeply with the material — which is what leads to better grades.
            </p>
          </div>
        </div>

        {/* Technique 5 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">5. Gratitude Check After Studying</h2>
          <p className="text-base text-foreground leading-relaxed mb-3">
            Before ending your study session, acknowledge one thing you learned or understood better.
          </p>
          <div className="bg-pink-50 dark:bg-pink-950/30 rounded-lg p-4 border-l-4 border-pink-500">
            <p className="text-sm text-foreground italic">
              This simple practice reduces anxiety, boosts motivation, and helps reinforce positive study habits.
            </p>
          </div>
        </div>

        {/* Conclusion */}
        <p className="text-base text-foreground leading-relaxed">
          Remember, mindfulness isn't about perfection. It's about bringing awareness to your study process and making intentional choices that support your learning and well-being.
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
