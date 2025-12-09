"use client";

import { useState, useEffect, useCallback } from "react";
import { translateText, translateBatch } from "@/lib/translation";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/locales/translations";

/**
 * Hook for translating dynamic content
 * First checks static translations, then falls back to API translation
 */
export function useTranslate() {
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);

  /**
   * Translate a single text
   * Uses static translations if available, otherwise uses API
   */
  const translate = useCallback(
    async (text: string, key?: string): Promise<string> => {
      // If text is empty, return empty
      if (!text || text.trim() === "") {
        return text;
      }

      // Try to get static translation first using key
      if (key) {
        const staticTranslation = getTranslation(language, key);
        if (staticTranslation !== key) {
          return staticTranslation;
        }
      }

      // If target language is English, return original
      if (language === "en") {
        return text;
      }

      try {
        setIsTranslating(true);
        const translated = await translateText(text, language, "en");
        return translated;
      } catch (error) {
        console.error("Translation error:", error);
        return text;
      } finally {
        setIsTranslating(false);
      }
    },
    [language]
  );

  /**
   * Translate multiple texts at once
   * More efficient for translating lists or multiple elements
   */
  const translateMultiple = useCallback(
    async (texts: string[]): Promise<string[]> => {
      if (language === "en") {
        return texts;
      }

      try {
        setIsTranslating(true);
        const translated = await translateBatch(texts, language, "en");
        return translated;
      } catch (error) {
        console.error("Batch translation error:", error);
        return texts;
      } finally {
        setIsTranslating(false);
      }
    },
    [language]
  );

  return {
    translate,
    translateMultiple,
    isTranslating,
    currentLanguage: language,
  };
}

/**
 * Hook for translating content with auto-refresh on language change
 */
export function useAutoTranslate(text: string, key?: string) {
  const { translate, currentLanguage } = useTranslate();
  const [translatedText, setTranslatedText] = useState(text);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const performTranslation = async () => {
      if (!text) {
        setTranslatedText("");
        return;
      }

      setLoading(true);
      try {
        const result = await translate(text, key);
        if (mounted) {
          setTranslatedText(result);
        }
      } catch (error) {
        console.error("Auto-translate error:", error);
        if (mounted) {
          setTranslatedText(text);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    performTranslation();

    return () => {
      mounted = false;
    };
  }, [text, currentLanguage, key, translate]);

  return { translatedText, loading };
}
