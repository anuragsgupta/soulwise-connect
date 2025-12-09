"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslate } from "@/hooks/useTranslate";
import { useLanguage } from "@/contexts/LanguageContext";
import TranslatedText from "@/components/translation/TranslatedText";

/**
 * Example component demonstrating translation system usage
 * This can be used as reference or removed in production
 */
export default function TranslationExample() {
  const { translate, translateMultiple, isTranslating } = useTranslate();
  const { language, currentLanguageInfo } = useLanguage();
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    const result = await translate(inputText);
    setTranslatedText(result);
  };

  const exampleTexts = [
    "Welcome to our mental health platform",
    "How are you feeling today?",
    "Book a session with a counselor",
    "Track your mood and wellness",
    "Access helpful resources",
  ];

  const [batchResults, setBatchResults] = useState<string[]>([]);

  const handleBatchTranslate = async () => {
    const results = await translateMultiple(exampleTexts);
    setBatchResults(results);
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Translation System Demo</CardTitle>
          <p className="text-sm text-gray-600">
            Current Language: {currentLanguageInfo.nativeName} ({language})
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Single Translation */}
          <div className="space-y-2">
            <h3 className="font-semibold">Single Text Translation</h3>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to translate..."
              rows={3}
            />
            <Button 
              onClick={handleTranslate} 
              disabled={isTranslating || !inputText.trim()}
            >
              {isTranslating ? "Translating..." : "Translate"}
            </Button>
            
            {translatedText && (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-semibold">Translated:</p>
                <p>{translatedText}</p>
              </div>
            )}
          </div>

          {/* Batch Translation */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-semibold">Batch Translation Example</h3>
            <Button onClick={handleBatchTranslate} disabled={isTranslating}>
              {isTranslating ? "Translating..." : "Translate Multiple Texts"}
            </Button>
            
            {batchResults.length > 0 && (
              <div className="space-y-2">
                {exampleTexts.map((original, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600">Original: {original}</p>
                    <p className="font-medium">{batchResults[index]}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auto-Translate Component Example */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-semibold">Auto-Translate Component</h3>
            <div className="space-y-2">
              <TranslatedText 
                text="Welcome to SoulWise Connect" 
                as="p"
                className="text-lg font-bold text-purple-600"
              />
              <TranslatedText 
                text="Your mental wellness matters to us" 
                as="p"
                className="text-sm text-gray-600"
              />
              <TranslatedText 
                text="Get support when you need it" 
                as="p"
                className="text-sm text-gray-600"
              />
            </div>
          </div>

          {/* Translation Info */}
          <div className="pt-4 border-t bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">System Information</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Using LibreTranslate (Free & Open Source)</li>
              <li>✅ 3 Fallback servers for reliability</li>
              <li>✅ Automatic caching to reduce API calls</li>
              <li>✅ Supports 11 Indian languages</li>
              <li>✅ Graceful fallback to original text on errors</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
