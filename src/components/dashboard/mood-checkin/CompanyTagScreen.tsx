"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CompanyTagScreenProps {
  onNext: (company: string[]) => void;
  onBack: () => void;
  initialCompany?: string[];
}

const predefinedCompany = [
  { id: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
  { id: "myself", label: "By Myself", icon: "🧘" },
  { id: "stranger", label: "Stranger", icon: "🤷" },
  { id: "friends", label: "Friends", icon: "👥" },
  { id: "pets", label: "Pets", icon: "🐕" },
];

export default function CompanyTagScreen({ onNext, onBack, initialCompany = [] }: CompanyTagScreenProps) {
  const [selectedCompany, setSelectedCompany] = useState<string[]>(initialCompany);
  const [customCompany, setCustomCompany] = useState<string[]>([]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newCompany, setNewCompany] = useState("");

  const toggleCompany = (companyId: string) => {
    setSelectedCompany(prev =>
      prev.includes(companyId)
        ? prev.filter(c => c !== companyId)
        : [...prev, companyId]
    );
  };

  const addCustomCompany = () => {
    if (newCompany.trim()) {
      const customId = `custom_${Date.now()}`;
      setCustomCompany(prev => [...prev, newCompany.trim()]);
      setSelectedCompany(prev => [...prev, customId]);
      setNewCompany("");
      setShowAddInput(false);
    }
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full min-h-0 overflow-y-auto">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 flex-shrink-0">
          Who is there with you now?
        </h1>

        {/* Company Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {predefinedCompany.map((company) => (
            <button
              key={company.id}
              onClick={() => toggleCompany(company.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 ${
                selectedCompany.includes(company.id)
                  ? 'bg-pink-100 ring-4 ring-pink-400 shadow-lg transform scale-105'
                  : 'bg-white hover:bg-gray-50 shadow-md hover:shadow-lg'
              }`}
            >
              <div className="text-3xl mb-2">{company.icon}</div>
              <div className="text-xs font-medium text-gray-700 text-center">
                {company.label}
              </div>
            </button>
          ))}
          
          {/* Add Custom Company Button */}
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
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomCompany()}
                placeholder="Type person/group..."
                className="flex-1"
                autoFocus
              />
              <Button onClick={addCustomCompany} size="sm">Add</Button>
              <Button onClick={() => setShowAddInput(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Custom Company */}
        {customCompany.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {customCompany.map((company, index) => (
              <button
                key={`custom_${index}`}
                onClick={() => toggleCompany(`custom_${index}`)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 ${
                  selectedCompany.includes(`custom_${index}`)
                    ? 'bg-purple-100 ring-4 ring-purple-400 shadow-lg transform scale-105'
                    : 'bg-purple-100 hover:shadow-lg'
                }`}
              >
                <div className="text-3xl mb-2">👤</div>
                <div className="text-xs font-medium text-gray-700 text-center">
                  {company}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Decorative illustration - City scene */}
        <div className="flex-1 flex items-end justify-center relative mb-8">
          <div className="relative w-full h-48">
            {/* Buildings */}
            <div className="absolute bottom-0 left-10 w-16 h-32 bg-blue-300/40 rounded-t-lg"></div>
            <div className="absolute bottom-0 left-28 w-20 h-40 bg-blue-400/40 rounded-t-lg"></div>
            <div className="absolute bottom-0 right-28 w-16 h-36 bg-blue-300/40 rounded-t-lg"></div>
            <div className="absolute bottom-0 right-10 w-20 h-28 bg-blue-400/40 rounded-t-lg"></div>
            
            {/* Person in center */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-6xl">
              👤
            </div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="w-full max-w-md mx-auto flex-shrink-0 mt-4">
        <Button
          onClick={() => onNext(selectedCompany)}
          disabled={selectedCompany.length === 0}
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
              step === 4 ? 'w-8 bg-gray-800' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>
      </div>
    </div>
  );
}
