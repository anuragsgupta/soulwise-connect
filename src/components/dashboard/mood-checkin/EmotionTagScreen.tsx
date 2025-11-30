"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface EmotionTagScreenProps {
  onNext: (emotions: string[]) => void;
  onBack: () => void;
  initialEmotions?: string[];
}

const emotions = [
  { id: "grateful", emoji: "🙏", label: "Grateful" },
  { id: "selflove", emoji: "😌", label: "Self Love" },
  { id: "swag", emoji: "😎", label: "Swag" },
  { id: "proud", emoji: "🤠", label: "Proud" },
  { id: "relieve", emoji: "😅", label: "Relieve" },
  { id: "joyful", emoji: "😄", label: "Joyful" },
  { id: "chill", emoji: "😋", label: "Chill" },
  { id: "excited", emoji: "🤩", label: "Excited" },
];

export default function EmotionTagScreen({ onNext, onBack, initialEmotions = [] }: EmotionTagScreenProps) {
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(initialEmotions);

  const toggleEmotion = (emotionId: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotionId)
        ? prev.filter(e => e !== emotionId)
        : [...prev, emotionId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-sky-100 via-sky-50 to-blue-100 overflow-hidden">
      <div className="h-full flex flex-col p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center mb-4 sm:mb-6 flex-shrink-0">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/50 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full min-h-0 overflow-y-auto">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 flex-shrink-0">
          Which emoji suits you?
        </h1>

        {/* Emotion Grid */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-4 flex-shrink-0">
          {emotions.map((emotion) => (
            <button
              key={emotion.id}
              onClick={() => toggleEmotion(emotion.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 ${
                selectedEmotions.includes(emotion.id)
                  ? 'bg-yellow-200 ring-4 ring-yellow-400 shadow-lg transform scale-105'
                  : 'bg-white hover:bg-gray-50 shadow-md hover:shadow-lg'
              }`}
            >
              <div className="text-4xl mb-2">{emotion.emoji}</div>
              <div className="text-xs font-medium text-gray-700 text-center">
                {emotion.label}
              </div>
            </button>
          ))}
        </div>

        {/* Decorative illustration */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <svg viewBox="0 0 200 200" className="w-64 h-64">
              {/* Person sitting at desk */}
              <circle cx="100" cy="60" r="25" fill="#FCD34D" />
              <rect x="75" y="85" width="50" height="60" rx="10" fill="#60A5FA" />
              <rect x="40" y="140" width="120" height="8" rx="4" fill="#94A3B8" />
            </svg>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="w-full max-w-md mx-auto flex-shrink-0 mt-4">
        <Button
          onClick={() => onNext(selectedEmotions)}
          disabled={selectedEmotions.length === 0}
          className="w-full bg-gray-800 hover:bg-gray-900 text-white py-4 sm:py-6 rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
              step === 2 ? 'w-8 bg-gray-800' : step < 2 ? 'w-2 bg-gray-800' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>
      </div>
    </div>
  );
}
