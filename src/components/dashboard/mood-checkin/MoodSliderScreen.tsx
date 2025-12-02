"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, Moon, Zap, Brain, Heart, Activity } from "lucide-react";

interface MoodSliderScreenProps {
  onNext: (moodLevel: number, selectedEmoji: string, moodFactors: Record<string, number>) => void;
  onBack?: () => void;
  initialMood?: number;
  initialEmoji?: string;
  initialFactors?: Record<string, number>;
}

const moodRanges = {
  negative: { min: 1, max: 2, label: "Negative" },
  neutral: { min: 3, max: 4, label: "Neutral" },
  positive: { min: 5, max: 7, label: "Positive" }
};

// Emoji options based on mood range
const emojisByMood = {
  negative: [
    { emoji: "😢", label: "Crying" },
    { emoji: "😭", label: "Sobbing" },
    { emoji: "😞", label: "Disappointed" },
    { emoji: "😔", label: "Pensive" },
    { emoji: "😟", label: "Worried" },
    { emoji: "😖", label: "Confounded" },
    { emoji: "😣", label: "Persevering" },
    { emoji: "😩", label: "Weary" },
  ],
  neutral: [
    { emoji: "😐", label: "Neutral" },
    { emoji: "😑", label: "Expressionless" },
    { emoji: "😶", label: "No Mouth" },
    { emoji: "🙂", label: "Slight Smile" },
    { emoji: "😏", label: "Smirking" },
    { emoji: "🤔", label: "Thinking" },
    { emoji: "🤨", label: "Raised Eyebrow" },
    { emoji: "😌", label: "Relieved" },
  ],
  positive: [
    { emoji: "😊", label: "Smiling" },
    { emoji: "😀", label: "Grinning" },
    { emoji: "😃", label: "Happy" },
    { emoji: "😄", label: "Laughing" },
    { emoji: "😁", label: "Beaming" },
    { emoji: "🤩", label: "Star-Struck" },
    { emoji: "😍", label: "Heart Eyes" },
    { emoji: "🥳", label: "Partying" },
  ]
};

const moodFactors = [
  { id: 'sleep', label: 'Sleep Quality', icon: Moon },
  { id: 'energy', label: 'Energy Level', icon: Zap },
  { id: 'stress', label: 'Stress Level', icon: Brain },
  { id: 'social', label: 'Social Connection', icon: Heart },
  { id: 'exercise', label: 'Physical Activity', icon: Activity },
];

export default function MoodSliderScreen({ 
  onNext, 
  onBack, 
  initialMood = 4, 
  initialEmoji = "😊",
  initialFactors = {}
}: MoodSliderScreenProps) {
  const [moodValue, setMoodValue] = useState([initialMood]);
  const [selectedEmoji, setSelectedEmoji] = useState(initialEmoji);
  const [factorLevels, setFactorLevels] = useState<Record<string, number>>(initialFactors);

  // Determine current mood range
  const getMoodRange = (value: number): keyof typeof emojisByMood => {
    if (value <= moodRanges.negative.max) return 'negative';
    if (value <= moodRanges.neutral.max) return 'neutral';
    return 'positive';
  };

  const currentMoodRange = getMoodRange(moodValue[0]);
  const availableEmojis = emojisByMood[currentMoodRange];

  const setFactorLevel = (factorId: string, level: number) => {
    setFactorLevels(prev => ({
      ...prev,
      [factorId]: level
    }));
  };

  const handleNext = () => {
    onNext(moodValue[0], selectedEmoji, factorLevels);
  };

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

        {/* Section 2: Which emoji suits you? */}
        <div className="mb-6 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">
            Which emoji suits you?
          </h2>
          <p className="text-xs text-gray-600 mb-4 text-center capitalize">
            Based on your mood: {currentMoodRange}
          </p>

          {/* Emoji Grid */}
          <div className="grid grid-cols-4 gap-3">
            {availableEmojis.map((item) => (
              <button
                key={item.emoji}
                onClick={() => setSelectedEmoji(item.emoji)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${
                  selectedEmoji === item.emoji
                    ? 'bg-white ring-4 ring-teal-400 shadow-lg transform scale-105'
                    : 'bg-white/60 hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="text-3xl mb-1">{item.emoji}</div>
                <div className="text-[10px] text-gray-700 text-center leading-tight">
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full min-h-0 overflow-y-auto pb-4">
        {/* Section 1: How are you feeling? */}
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
            How are you feeling?
          </h1>

          {/* Mood Slider */}
          <div className="w-full px-2 mb-2">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-md">
              <Slider
                value={moodValue}
                onValueChange={setMoodValue}
                min={1}
                max={7}
                step={1}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between mt-4 text-xs text-gray-600">
                <span>Very Bad</span>
                <span>Neutral</span>
                <span>Very Good</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: What's affecting your mood today? */}
        <div className="mb-4 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">
            What&apos;s affecting your mood today?
          </h2>
          <p className="text-xs text-gray-600 mb-4 text-center">
            Rate each factor from 1 (very low) to 5 (very high)
          </p>

          {/* Factors with 5-level bubbles */}
          <div className="space-y-4">
            {moodFactors.map((factor) => (
              <div key={factor.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center mb-3">
                  <factor.icon className="w-5 h-5 mr-2 text-gray-700" />
                  <span className="text-sm font-medium text-gray-800">
                    {factor.label}
                  </span>
                </div>
                
                {/* 5-level bubble selector */}
                <div className="flex justify-between items-center">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setFactorLevel(factor.id, level)}
                      className={`transition-all duration-300 rounded-full flex items-center justify-center ${
                        factorLevels[factor.id] === level
                          ? 'w-12 h-12 bg-teal-500 ring-4 ring-teal-200 shadow-lg transform scale-110'
                          : factorLevels[factor.id] && factorLevels[factor.id] >= level
                          ? 'w-10 h-10 bg-teal-400'
                          : 'w-8 h-8 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Level ${level}`}
                    >
                      <span className={`text-xs font-bold ${
                        factorLevels[factor.id] && factorLevels[factor.id] >= level
                          ? 'text-white'
                          : 'text-gray-600'
                      }`}>
                        {level}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="w-full max-w-md mx-auto flex-shrink-0">
        <Button
          onClick={handleNext}
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
