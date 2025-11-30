"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft } from "lucide-react";

interface MoodSliderScreenProps {
  onNext: (moodLevel: number) => void;
  onBack?: () => void;
  initialMood?: number;
}

const moodSteps = [
  { value: 1, emoji: "😢", label: "Terrible", color: "from-red-500 to-red-600" },
  { value: 2, emoji: "😟", label: "Bad", color: "from-orange-400 to-orange-500" },
  { value: 3, emoji: "😐", label: "Okay", color: "from-yellow-400 to-amber-500" },
  { value: 4, emoji: "😊", label: "Good", color: "from-lime-400 to-green-500" },
  { value: 5, emoji: "😄", label: "Great", color: "from-green-400 to-emerald-500" },
  { value: 6, emoji: "🤩", label: "Amazing", color: "from-teal-400 to-cyan-500" },
  { value: 7, emoji: "🥳", label: "Awesome", color: "from-purple-400 to-violet-500" },
];

export default function MoodSliderScreen({ onNext, onBack, initialMood = 4 }: MoodSliderScreenProps) {
  const [moodValue, setMoodValue] = useState([initialMood]);
  
  const currentMood = moodSteps.find(step => step.value === moodValue[0]) || moodSteps[3];

  return (
    <div className="fixed inset-0 z-[60] bg-gradient-to-br from-sky-100 via-sky-50 to-blue-100 overflow-hidden">
      <div className="h-full flex flex-col p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center mb-4 sm:mb-6 flex-shrink-0">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
        )}
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-600 bg-white/50 px-3 py-1 rounded-full inline-block">
            Today
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full min-h-0">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">
          How are you feeling?
        </h1>

        {/* Emoji Display */}
        <div className={`mb-6 sm:mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br ${currentMood.color} shadow-lg transition-all duration-300`}>
          <div className="text-6xl sm:text-8xl text-center filter drop-shadow-lg">
            {currentMood.emoji}
          </div>
        </div>

        {/* Mood Label */}
        <div className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 sm:mb-8">
          {currentMood.label}
        </div>

        {/* Slider with better touch targets */}
        <div className="w-full mb-4 px-2">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-md">
            <Slider
              value={moodValue}
              onValueChange={setMoodValue}
              min={1}
              max={7}
              step={1}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between mt-4 text-lg sm:text-xl">
              <span>😢</span>
              <span>😟</span>
              <span>😐</span>
              <span>😊</span>
              <span>😄</span>
              <span>🤩</span>
              <span>🥳</span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 opacity-20">
          <svg viewBox="0 0 100 100" className="text-white fill-current">
            <circle cx="50" cy="50" r="40" />
          </svg>
        </div>
        <div className="absolute top-40 right-10 w-20 h-20 opacity-20">
          <svg viewBox="0 0 100 100" className="text-white fill-current">
            <path d="M50,10 Q90,50 50,90 Q10,50 50,10" />
          </svg>
        </div>
      </div>

      {/* Next Button */}
      <div className="w-full max-w-md mx-auto flex-shrink-0">
        <Button
          onClick={() => onNext(moodValue[0])}
          className="w-full bg-gray-800 hover:bg-gray-900 text-white py-4 sm:py-6 rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          size="lg"
        >
          Next
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center gap-2 mt-4 flex-shrink-0">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`h-2 rounded-full transition-all ${
              step === 1 ? 'w-8 bg-gray-800' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>
      </div>
    </div>
  );
}
