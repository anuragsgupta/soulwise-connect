"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Moon, Zap, Brain, Heart, Activity } from "lucide-react";

interface MoodFactorsScreenProps {
  onNext: (factors: string[]) => void;
  onBack: () => void;
  initialFactors?: string[];
}

const moodFactors = [
  { id: 'sleep', label: 'Sleep Quality', icon: Moon, color: "bg-indigo-100" },
  { id: 'energy', label: 'Energy Level', icon: Zap, color: "bg-yellow-100" },
  { id: 'stress', label: 'Stress Level', icon: Brain, color: "bg-red-100" },
  { id: 'social', label: 'Social Connection', icon: Heart, color: "bg-pink-100" },
  { id: 'exercise', label: 'Physical Activity', icon: Activity, color: "bg-green-100" },
];

export default function MoodFactorsScreen({ onNext, onBack, initialFactors = [] }: MoodFactorsScreenProps) {
  const [selectedFactors, setSelectedFactors] = useState<string[]>(initialFactors);

  const toggleFactor = (factorId: string) => {
    setSelectedFactors(prev =>
      prev.includes(factorId)
        ? prev.filter(f => f !== factorId)
        : [...prev, factorId]
    );
  };

  const handleNext = () => {
    onNext(selectedFactors);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-gradient-to-br from-sky-100 via-sky-50 to-blue-100 overflow-hidden">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex-shrink-0">
            What&apos;s affecting your mood today?
          </h1>
          <p className="text-sm text-gray-600 mb-6 flex-shrink-0">(Optional - Select all that apply)</p>

          {/* Factors Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {moodFactors.map((factor) => (
              <button
                key={factor.id}
                onClick={() => toggleFactor(factor.id)}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 ${
                  selectedFactors.includes(factor.id)
                    ? `${factor.color} ring-4 ring-teal-400 shadow-lg transform scale-105`
                    : `${factor.color} hover:shadow-lg`
                }`}
              >
                <factor.icon className="w-8 h-8 mb-3 text-gray-700" />
                <div className="text-sm font-medium text-gray-800 text-center">
                  {factor.label}
                </div>
              </button>
            ))}
          </div>

          {/* Skip hint */}
          <p className="text-xs text-gray-500 text-center mb-4 flex-shrink-0">
            You can skip this if nothing specific is affecting you today
          </p>
        </div>

        {/* Next/Skip Button */}
        <div className="w-full max-w-md mx-auto flex-shrink-0">
          <Button
            onClick={handleNext}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white py-4 sm:py-6 rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            size="lg"
          >
            {selectedFactors.length > 0 ? 'Next' : 'Skip'}
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mt-4 flex-shrink-0">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all ${
                step === 3 ? 'w-8 bg-gray-800' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
