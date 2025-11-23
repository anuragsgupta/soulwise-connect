/**
 * AI Provider Selector Component
 * 
 * Allows users to choose which AI model to use for the chatbot
 */

"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bot, Sparkles, Globe, Zap } from 'lucide-react';

type AIProvider = 'gemini' | 'sarvam' | 'openai' | 'claude';

interface AIProviderSelectorProps {
  value: AIProvider;
  onChange: (provider: AIProvider) => void;
  disabled?: boolean;
}

const PROVIDERS = [
  {
    id: 'gemini' as AIProvider,
    name: 'Gemini',
    description: 'Google AI - Fast & Reliable',
    icon: Sparkles,
    badge: 'Default',
    languages: ['English', 'Hindi'],
    available: true,
  },
  {
    id: 'sarvam' as AIProvider,
    name: 'Sarvam AI',
    description: 'Indian AI - Multilingual',
    icon: Globe,
    badge: 'New',
    languages: ['Hindi', 'English', '10+ Indian'],
    available: true,
  },
  {
    id: 'openai' as AIProvider,
    name: 'OpenAI',
    description: 'GPT-4 - Advanced Reasoning',
    icon: Zap,
    badge: 'Premium',
    languages: ['English'],
    available: false,
  },
  {
    id: 'claude' as AIProvider,
    name: 'Claude',
    description: 'Anthropic - Thoughtful AI',
    icon: Bot,
    badge: 'Premium',
    languages: ['English'],
    available: false,
  },
];

export function AIProviderSelector({ value, onChange, disabled }: AIProviderSelectorProps) {
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check which providers are available
    const checkProviders = async () => {
      try {
        const response = await fetch('/api/ai/providers');
        if (response.ok) {
          const data = await response.json();
          setAvailableProviders(data.available || ['gemini']);
        }
      } catch (error) {
        console.error('Failed to check providers:', error);
        setAvailableProviders(['gemini']); // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    checkProviders();
  }, []);

  const selectedProvider = PROVIDERS.find(p => p.id === value);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        AI Model
      </label>
      
      <Select
        value={value}
        onValueChange={onChange as (value: string) => void}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            {selectedProvider && (
              <div className="flex items-center gap-2">
                <selectedProvider.icon className="h-4 w-4" />
                <span>{selectedProvider.name}</span>
                {selectedProvider.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedProvider.badge}
                  </Badge>
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent>
          {PROVIDERS.map((provider) => {
            const isAvailable = availableProviders.includes(provider.id);
            const Icon = provider.icon;
            
            return (
              <SelectItem
                key={provider.id}
                value={provider.id}
                disabled={!isAvailable}
              >
                <div className="flex items-start gap-3 py-1">
                  <Icon className="h-5 w-5 mt-0.5 text-gray-600" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{provider.name}</span>
                      {provider.badge && (
                        <Badge 
                          variant={isAvailable ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {isAvailable ? provider.badge : 'Coming Soon'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {provider.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      Languages: {provider.languages.join(', ')}
                    </p>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {selectedProvider && (
        <p className="text-xs text-gray-500">
          {selectedProvider.description} • {selectedProvider.languages.join(', ')}
        </p>
      )}
    </div>
  );
}

/**
 * Simple provider toggle for quick switching
 */
export function AIProviderToggle({ value, onChange }: AIProviderSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={value === 'gemini' ? 'default' : 'outline'}
        onClick={() => onChange('gemini')}
      >
        <Sparkles className="h-4 w-4 mr-1" />
        Gemini
      </Button>
      
      <Button
        size="sm"
        variant={value === 'sarvam' ? 'default' : 'outline'}
        onClick={() => onChange('sarvam')}
      >
        <Globe className="h-4 w-4 mr-1" />
        Sarvam AI
      </Button>
    </div>
  );
}
