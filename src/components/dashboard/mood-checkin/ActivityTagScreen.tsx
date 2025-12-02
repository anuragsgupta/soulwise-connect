"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ActivityTagScreenProps {
  onNext: (activities: string[]) => void;
  onBack: () => void;
  initialActivities?: string[];
}

const predefinedActivities = [
  { id: "office", label: "Office Work", icon: "💼", color: "bg-blue-100" },
  { id: "studying", label: "Studying", icon: "📚", color: "bg-purple-100" },
  { id: "nothing", label: "Doing Nothing", icon: "🛋️", color: "bg-gray-100" },
  { id: "gaming", label: "Gaming", icon: "🎮", color: "bg-green-100" },
  { id: "reading", label: "Reading", icon: "📖", color: "bg-yellow-100" },
  { id: "music", label: "Listening Music", icon: "🎵", color: "bg-pink-100" },
];

export default function ActivityTagScreen({ onNext, onBack, initialActivities = [] }: ActivityTagScreenProps) {
  const [selectedActivities, setSelectedActivities] = useState<string[]>(initialActivities);
  const [customActivities, setCustomActivities] = useState<string[]>([]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newActivity, setNewActivity] = useState("");

  const toggleActivity = (activityId: string) => {
    setSelectedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(a => a !== activityId)
        : [...prev, activityId]
    );
  };

  const addCustomActivity = () => {
    if (newActivity.trim()) {
      const customId = `custom_${Date.now()}`;
      setCustomActivities(prev => [...prev, newActivity.trim()]);
      setSelectedActivities(prev => [...prev, customId]);
      setNewActivity("");
      setShowAddInput(false);
    }
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 flex-shrink-0">
          What are you doing?
        </h1>

        {/* Activity Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {predefinedActivities.map((activity) => (
            <button
              key={activity.id}
              onClick={() => toggleActivity(activity.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 ${
                selectedActivities.includes(activity.id)
                  ? `${activity.color} ring-4 ring-yellow-400 shadow-lg transform scale-105`
                  : `${activity.color} hover:shadow-lg`
              }`}
            >
              <div className="text-3xl mb-2">{activity.icon}</div>
              <div className="text-xs font-medium text-gray-700 text-center">
                {activity.label}
              </div>
            </button>
          ))}
          
          {/* Add Custom Activity Button */}
          {!showAddInput ? (
            <button
              onClick={() => setShowAddInput(true)}
              className="flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 bg-white hover:bg-gray-50 shadow-md hover:shadow-lg border-2 border-dashed border-gray-300"
            >
              <Plus className="w-8 h-8 text-gray-400 mb-2" />
              <div className="text-xs font-medium text-gray-600">Add</div>
            </button>
          ) : (
            <div className="col-span-3 flex gap-2">
              <Input
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomActivity()}
                placeholder="Type activity..."
                className="flex-1"
                autoFocus
              />
              <Button onClick={addCustomActivity} size="sm">Add</Button>
              <Button onClick={() => setShowAddInput(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Custom Activities */}
        {customActivities.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {customActivities.map((activity, index) => (
              <button
                key={`custom_${index}`}
                onClick={() => toggleActivity(`custom_${index}`)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 ${
                  selectedActivities.includes(`custom_${index}`)
                    ? 'bg-green-100 ring-4 ring-yellow-400 shadow-lg transform scale-105'
                    : 'bg-green-100 hover:shadow-lg'
                }`}
              >
                <div className="text-3xl mb-2">✨</div>
                <div className="text-xs font-medium text-gray-700 text-center">
                  {activity}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Decorative illustration - Beach scene */}
        <div className="flex-1 flex items-end justify-center relative mb-8">
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-200/30 to-transparent rounded-t-3xl"></div>
          <div className="relative">
            {/* Palm trees */}
            <div className="absolute -left-20 bottom-0 text-6xl opacity-60">🌴</div>
            <div className="absolute -right-16 bottom-0 text-5xl opacity-60">🌴</div>
            {/* Person */}
            <div className="text-7xl mb-4 animate-bounce-slow">🧘</div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="w-full max-w-md mx-auto flex-shrink-0 mt-4">
        <Button
          onClick={() => onNext(selectedActivities)}
          disabled={selectedActivities.length === 0}
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
              step === 3 ? 'w-8 bg-gray-800' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>
      </div>
    </div>
  );
}
