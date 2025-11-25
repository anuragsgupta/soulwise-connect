"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pause, Play, RotateCcw, Settings } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface BoxBreathingProps {
  onClose?: () => void;
}

export default function BoxBreathing({ onClose }: BoxBreathingProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0); // 0=inhale, 1=hold, 2=exhale, 3=hold
  const [count, setCount] = useState(4);
  const [cycles, setCycles] = useState(0);
  const [duration, setDuration] = useState(4);
  const [showSettings, setShowSettings] = useState(false);

  const phases = ['Breathe In', 'Hold', 'Breathe Out', 'Hold'];
  const colors = [
    'from-teal-400 to-cyan-500',
    'from-blue-400 to-indigo-500', 
    'from-purple-400 to-pink-500',
    'from-indigo-400 to-blue-500'
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev > 1) return prev - 1;

        // Move to next phase
        setPhase((p) => {
          const nextPhase = ((p + 1) % 4) as 0 | 1 | 2 | 3;
          if (nextPhase === 0) setCycles((c) => c + 1);
          return nextPhase;
        });
        return duration;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, duration]);

  const handleToggle = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setCount(duration);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setPhase(0);
    setCount(duration);
    setCycles(0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6 sm:p-8 bg-gradient-to-br from-sky/20 to-primary/10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-primary">
              Box Breathing
            </h2>
            <p className="text-sm text-muted-foreground mt-1 font-body">
              Navy SEAL technique for stress relief
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4" />
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

        {/* Settings Panel */}
        {showSettings && (
          <Card className="p-4 mb-6 bg-primary/5">
            <label className="text-sm font-medium mb-3 block font-heading">
              Breath Duration: {duration} seconds
            </label>
            <Slider
              value={[duration]}
              onValueChange={(value) => {
                setDuration(value[0]);
                setCount(value[0]);
              }}
              min={3}
              max={8}
              step={1}
              className="mb-2"
              disabled={isPlaying}
            />
            <p className="text-xs text-muted-foreground mt-2 font-body">
              Adjust timing for each phase (3-8 seconds)
            </p>
          </Card>
        )}

        {/* Box Visualization */}
        <div className="relative w-full aspect-square max-w-md mx-auto mb-8">
          {/* The Box */}
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {/* Box outline */}
            <rect
              x="25" y="25"
              width="150" height="150"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="text-primary/30"
            />

            {/* Phase indicators at corners */}
            {[
              { x: 25, y: 25, label: 'Start' },
              { x: 175, y: 25, label: '1' },
              { x: 175, y: 175, label: '2' },
              { x: 25, y: 175, label: '3' }
            ].map((corner, i) => (
              <circle
                key={i}
                cx={corner.x}
                cy={corner.y}
                r="8"
                className={`transition-all ${phase === i ? 'fill-primary' : 'fill-primary/20'}`}
              />
            ))}

            {/* Animated dot */}
            <circle
              cx={phase === 0 ? 25 + (150 * (duration - count) / duration) : 
                 phase === 1 ? 175 :
                 phase === 2 ? 175 - (150 * (duration - count) / duration) :
                 25}
              cy={phase === 0 ? 25 :
                 phase === 1 ? 25 + (150 * (duration - count) / duration) :
                 phase === 2 ? 175 :
                 175 - (150 * (duration - count) / duration)}
              r="12"
              className={`fill-primary shadow-lg transition-all duration-1000`}
            >
              <animate
                attributeName="r"
                values="12;16;12"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Center text */}
            <text
              x="100"
              y="95"
              textAnchor="middle"
              className="text-3xl font-bold fill-primary font-heading"
            >
              {isPlaying ? count : '●'}
            </text>
            <text
              x="100"
              y="115"
              textAnchor="middle"
              className="text-sm fill-muted-foreground font-accent"
            >
              {isPlaying ? phases[phase] : 'Ready'}
            </text>
          </svg>
        </div>

        {/* Phase Indicator */}
        <div className="flex gap-2 justify-center mb-6">
          {phases.map((name, i) => (
            <div
              key={i}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${phase === i && isPlaying
                  ? 'bg-primary text-white scale-110'
                  : 'bg-primary/10 text-primary/50'}
              `}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-primary font-heading">
              {cycles}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground font-body">
              Cycles
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-primary font-heading">
              {Math.floor(cycles * duration * 4 / 60)}:{String(cycles * duration * 4 % 60).padStart(2, '0')}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground font-body">
              Time
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={handleToggle}
            size="lg"
            className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 font-accent"
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
            className="font-accent"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-primary/5 rounded-lg">
          <p className="text-xs sm:text-sm text-center text-muted-foreground font-body leading-relaxed">
            <strong className="text-primary">Navy SEAL Technique:</strong> Follow the dot around the box. 
            Breathe in (top), hold (right), breathe out (bottom), hold (left). 
            Equal timing creates a calming rhythm perfect for stress relief.
          </p>
        </div>
      </Card>
    </div>
  );
}
