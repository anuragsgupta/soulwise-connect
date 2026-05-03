"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Moon, Zap, Brain, Heart, Activity } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface MoodFactorsScreenProps {
  onNext: (moodFactors: Record<string, number>) => void;
  onBack: () => void;
  initialFactors?: Record<string, number>;
}

const moodFactors = [
  { id: 'sleep', label: 'Sleep Quality', icon: Moon },
  { id: 'energy', label: 'Energy Level', icon: Zap },
  { id: 'stress', label: 'Stress Level', icon: Brain },
  { id: 'social', label: 'Social Connection', icon: Heart },
  { id: 'exercise', label: 'Physical Activity', icon: Activity },
];

export default function MoodFactorsScreen({ 
  onNext, 
  onBack, 
  initialFactors = {}
}: MoodFactorsScreenProps) {
  const [factorLevels, setFactorLevels] = useState<Record<string, number>>(initialFactors);

  const setFactorLevel = (factorId: string, level: number) => {
    setFactorLevels(prev => ({
      ...prev,
      [factorId]: level
    }));
  };

  const handleNext = () => {
    onNext(factorLevels);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-iceBlue overflow-hidden">
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

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full min-h-0 overflow-y-auto pb-4">
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
            What&apos;s affecting your mood today?
          </h1>
          <p className="text-sm text-gray-600 text-center">
            Rate each factor from 1 (very low) to 5 (very high)
          </p>
        </div>

        {/* Factors with slider */}
        <div className="space-y-6">
          {moodFactors.map((factor) => (
            <div key={factor.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-5">
              <div className="flex items-center mb-4">
                <factor.icon className="w-5 h-5 mr-2 text-gray-700" />
                <span className="text-sm font-medium text-gray-800">
                  {factor.label}
                </span>
                {factorLevels[factor.id] && (
                  <span className="ml-auto text-lg font-bold text-teal-600">
                    {factorLevels[factor.id]}
                  </span>
                )}
              </div>
              
              {/* Slider */}
              <div className="px-2">
                <Slider
                  value={[factorLevels[factor.id] || 3]}
                  onValueChange={(value) => setFactorLevel(factor.id, value[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>
            </div>
          ))}
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
        {[1, 2, 3].map((step) => (
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
