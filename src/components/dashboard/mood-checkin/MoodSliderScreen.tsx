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

const moodLabels = [
  { level: 1, emoji: "😢", label: "Very Low" },
  { level: 2, emoji: "😞", label: "Low" },
  { level: 3, emoji: "😐", label: "Slightly Low" },
  { level: 4, emoji: "🙂", label: "Neutral" },
  { level: 5, emoji: "😊", label: "Good" },
  { level: 6, emoji: "😄", label: "Great" },
  { level: 7, emoji: "🤩", label: "Excellent" },
];

export default function MoodSliderScreen({
  onNext,
  onBack,
  initialMood = 4,
}: MoodSliderScreenProps) {
  const [moodLevel, setMoodLevel] = useState(initialMood);

  const handleNext = () => {
    onNext(moodLevel);
  };

  const currentMood = moodLabels.find(m => m.level === moodLevel) || moodLabels[3];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-sky-100 via-sky-50 to-blue-100 p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
              Today
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">
            How are you feeling?
          </h2>
          <p className="text-gray-500">
            Slide to select your mood level
          </p>
        </div>

        {/* Current Mood Display */}
        <div className="flex flex-col items-center space-y-4 py-8">
          <div className="text-8xl animate-bounce">{currentMood.emoji}</div>
          <div className="text-2xl font-semibold text-gray-800">
            {currentMood.label}
          </div>
        </div>

        {/* Mood Slider */}
        <div className="space-y-6">
          <Slider
            value={[moodLevel]}
            onValueChange={(value) => setMoodLevel(value[0])}
            min={1}
            max={7}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>😢 Very Low</span>
            <span>🙂 Neutral</span>
            <span>🤩 Excellent</span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-2">
          <div className="w-8 h-1.5 bg-teal-500 rounded-full"></div>
          <div className="w-8 h-1.5 bg-gray-200 rounded-full"></div>
          <div className="w-8 h-1.5 bg-gray-200 rounded-full"></div>
        </div>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 text-white py-6 text-lg font-semibold rounded-xl shadow-lg"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
