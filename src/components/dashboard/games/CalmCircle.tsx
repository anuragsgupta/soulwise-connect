"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface CalmCircleProps {
  onClose?: () => void;
}

export default function CalmCircle({ onClose }: CalmCircleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [progress, setProgress] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  // Customizable timings
  const [inhaleTime, setInhaleTime] = useState(4);
  const [holdTime, setHoldTime] = useState(7);
  const [exhaleTime, setExhaleTime] = useState(8);

  const currentDuration = 
    phase === 'inhale' ? inhaleTime :
    phase === 'hold' ? holdTime :
    exhaleTime;

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (currentDuration * 10));
        
        if (newProgress >= 100) {
          // Move to next phase
          if (phase === 'inhale') {
            setPhase('hold');
          } else if (phase === 'hold') {
            setPhase('exhale');
          } else {
            setPhase('inhale');
            setCycles((c) => c + 1);
          }
          return 0;
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, phase, currentDuration]);

  const handleToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setPhase('inhale');
    setProgress(0);
    setCycles(0);
  };

  const getCircleScale = () => {
    if (phase === 'inhale') {
      return 0.5 + (progress / 100) * 0.5; // 50% to 100%
    } else if (phase === 'exhale') {
      return 1 - (progress / 100) * 0.5; // 100% to 50%
    }
    return 1; // Hold at 100%
  };

  const getCircleColor = () => {
    if (phase === 'inhale') return 'from-healthGreen to-healthGreen';
    if (phase === 'hold') return 'from-medicalBlue to-medicalBlue';
    return 'from-calmPurple to-calmPurple';
  };

  const totalTime = cycles * (inhaleTime + holdTime + exhaleTime);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <Card className="w-full max-w-lg lg:max-w-2xl my-auto bg-background border-2 border-primary/20">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-heading text-primary">
                Calm Circle
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-body">
                4-7-8 breathing technique for relaxation
              </p>
            </div>
            <div className="flex gap-2 -mt-1 -mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-muted-foreground hover:text-foreground"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              )}
            </div>
          </div>

          {/* Customization Controls */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/10">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs sm:text-sm font-medium font-heading">Inhale</label>
                <span className="text-xs sm:text-sm text-muted-foreground">{inhaleTime}s</span>
              </div>
              <Slider
                value={[inhaleTime]}
                onValueChange={(value) => setInhaleTime(value[0])}
                min={2}
                max={8}
                step={1}
                disabled={isPlaying}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs sm:text-sm font-medium font-heading">Hold</label>
                <span className="text-xs sm:text-sm text-muted-foreground">{holdTime}s</span>
              </div>
              <Slider
                value={[holdTime]}
                onValueChange={(value) => setHoldTime(value[0])}
                min={2}
                max={10}
                step={1}
                disabled={isPlaying}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs sm:text-sm font-medium font-heading">Exhale</label>
                <span className="text-xs sm:text-sm text-muted-foreground">{exhaleTime}s</span>
              </div>
              <Slider
                value={[exhaleTime]}
                onValueChange={(value) => setExhaleTime(value[0])}
                min={2}
                max={12}
                step={1}
                disabled={isPlaying}
              />
            </div>
          </div>

          {/* Animated Circle */}
          <div className="relative w-full aspect-square max-w-[280px] sm:max-w-sm md:max-w-md mx-auto mb-5 sm:mb-6 flex items-center justify-center">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            
            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${progress * 2.83} 283`}
                className="text-primary transition-all duration-100"
              />
            </svg>

            {/* Pulsing circle */}
            <div
              className={`
                aspect-square rounded-full bg-gradient-to-br ${getCircleColor()}
                flex items-center justify-center shadow-2xl
                transition-all duration-100
              `}
              style={{
                width: `${getCircleScale() * 70}%`,
                height: `${getCircleScale() * 70}%`,
              }}
            >
              <div className="text-center text-white">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2 font-heading">
                  {Math.ceil(currentDuration - (progress / 100) * currentDuration)}
                </div>
                <div className="text-xs sm:text-sm md:text-base font-medium uppercase tracking-wider font-accent">
                  {phase}
                </div>
              </div>
            </div>

            {/* Glow effect */}
            <div
              className={`
                absolute aspect-square rounded-full blur-3xl opacity-30
                bg-gradient-to-br ${getCircleColor()}
              `}
              style={{
                width: `${getCircleScale() * 80}%`,
                height: `${getCircleScale() * 80}%`,
              }}
            />
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
                {Math.floor(totalTime / 60)}:{String(totalTime % 60).padStart(2, '0')}
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
              className="w-full sm:w-auto bg-medicalBlue hover:bg-medicalBlue-dark font-accent"
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
              <strong className="text-primary">4-7-8 Technique:</strong> Developed by Dr. Andrew Weil, 
              this pattern activates your parasympathetic nervous system, promoting deep relaxation. 
              Perfect for reducing anxiety and improving sleep quality.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
