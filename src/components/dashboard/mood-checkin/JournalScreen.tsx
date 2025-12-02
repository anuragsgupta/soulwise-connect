"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, PenLine } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface JournalScreenProps {
  onDone: (journal: string) => void;
  onBack: () => void;
  initialJournal?: string;
}

export default function JournalScreen({ onDone, onBack, initialJournal = "" }: JournalScreenProps) {
  const [journal, setJournal] = useState(initialJournal);

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
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full min-h-0">
        {/* Title and Icon */}
        <div className="flex items-center mb-4 sm:mb-6 flex-shrink-0">
          <div className="bg-white p-3 rounded-full shadow-md mr-3">
            <PenLine className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            What are your thoughts?
          </h1>
        </div>

        {/* Journal Input */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-4 sm:p-6 flex-1 flex flex-col mb-4 min-h-0">
          <Textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="Share your thoughts about today... What made you feel this way?"
            className="flex-1 border-none resize-none text-base focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-gray-400"
            style={{ minHeight: '200px' }}
          />
          
          {/* Character count */}
          <div className="text-right text-sm text-gray-400 mt-2">
            {journal.length} characters
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-10 text-4xl opacity-20 animate-bounce-slow">
          ☁️
        </div>
        <div className="absolute top-40 left-10 text-4xl opacity-20 animate-bounce-slow" style={{ animationDelay: '1s' }}>
          ☁️
        </div>
      </div>

      {/* Done Button */}
      <div className="w-full max-w-md mx-auto flex-shrink-0">
        <Button
          onClick={() => onDone(journal)}
          className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-4 sm:py-6 rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          size="lg"
        >
          Done
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center gap-2 mt-4 flex-shrink-0">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`h-2 rounded-full transition-all ${
              step === 5 ? 'w-8 bg-gray-800' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>
      </div>
    </div>
  );
}
