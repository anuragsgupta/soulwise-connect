"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pause, Play, RotateCcw } from "lucide-react";

interface BreathingBallProps {
  onClose?: () => void;
}

export default function BreathingBall({ onClose }: BreathingBallProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('rest');
  const [count, setCount] = useState(4);
  const [cycles, setCycles] = useState(0);

  const durations = {
    inhale: 4,
    hold: 4,
    exhale: 4,
    rest: 2
  };

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev > 1) return prev - 1;

        // Move to next phase
        if (phase === 'rest') {
          setPhase('inhale');
          return durations.inhale;
        } else if (phase === 'inhale') {
          setPhase('hold');
          return durations.hold;
        } else if (phase === 'hold') {
          setPhase('exhale');
          return durations.exhale;
        } else {
          setCycles((c) => c + 1);
          setPhase('rest');
          return durations.rest;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, phase]);

  const handleToggle = () => {
    setIsPlaying(!isPlaying);
    if (phase === 'rest' && !isPlaying) {
      setPhase('inhale');
      setCount(durations.inhale);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setPhase('rest');
    setCount(4);
    setCycles(0);
  };

  const getBallSize = () => {
    if (phase === 'inhale') return 'scale-150';
    if (phase === 'hold') return 'scale-150';
    if (phase === 'exhale') return 'scale-75';
    return 'scale-100';
  };

  const getPhaseText = () => {
    if (phase === 'rest') return 'Ready to begin';
    if (phase === 'inhale') return 'Breathe In';
    if (phase === 'hold') return 'Hold';
    return 'Breathe Out';
  };

  const getPhaseColor = () => {
    if (phase === 'inhale') return 'from-teal-400 to-cyan-500';
    if (phase === 'hold') return 'from-blue-400 to-indigo-500';
    if (phase === 'exhale') return 'from-purple-400 to-pink-500';
    return 'from-gray-300 to-gray-400';
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <Card className="w-full max-w-lg lg:max-w-2xl my-auto bg-background border-2 border-primary/20">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-heading text-primary">
                Interactive Breathing Ball
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-body">
                Follow the ball to regulate your breathing
              </p>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground -mt-1 -mr-2"
              >
                ✕
              </Button>
            )}
          </div>

          {/* Breathing Ball Container */}
          <div className="relative w-full aspect-square max-w-[280px] sm:max-w-sm md:max-w-md mx-auto mb-6 sm:mb-8 flex items-center justify-center">
            {/* Background circles */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20" />
            <div className="absolute inset-6 sm:inset-8 rounded-full border border-dashed border-primary/10" />
            
            {/* Animated Ball */}
            <div
              className={`
                relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full
                bg-gradient-to-br ${getPhaseColor()}
                shadow-2xl transition-all duration-[4000ms] ease-in-out
                ${getBallSize()}
                flex items-center justify-center
              `}
            >
              <div className="text-center text-white">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading mb-1">
                  {isPlaying ? count : '●'}
                </div>
                <div className="text-xs sm:text-sm font-medium font-accent">
                  {isPlaying ? getPhaseText() : 'Start'}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-6 sm:gap-8 mb-5 sm:mb-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary font-heading">
                {cycles}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-body">
                Cycles
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary font-heading">
                {Math.floor(cycles * 14 / 60)}:{String(cycles * 14 % 60).padStart(2, '0')}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-body">
                Time
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleToggle}
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 font-accent"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {cycles > 0 ? 'Resume' : 'Start'}
                </>
              )}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto font-accent border-2"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Instructions */}
          <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-xs sm:text-sm text-center text-muted-foreground font-body leading-relaxed">
              <strong className="text-primary">Tip:</strong> Watch the ball expand and contract. 
              Breathe in as it grows, hold as it stays large, and breathe out as it shrinks. 
              This 4-4-4 breathing pattern helps reduce anxiety and promote relaxation.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
