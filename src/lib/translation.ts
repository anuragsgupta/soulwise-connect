// Translation utility for dynamic content translation
// Uses LibreTranslate API - a free and open-source alternative to Google Translate
// Multiple public instances are available for redundancy

export interface TranslationRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface TranslationResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
}

// Language code mapping for LibreTranslate API
export const TRANSLATION_LANGUAGE_MAP: Record<string, string> = {
  en: "en",
  hi: "hi",
  mr: "mr",
  bn: "bn",
  te: "te",
  ta: "ta",
  gu: "gu",
  kn: "kn",
  ml: "ml",
  pa: "pa",
  or: "or",
};

// List of public LibreTranslate instances (fallback chain)
const LIBRETRANSLATE_INSTANCES = [
  "https://libretranslate.com/translate",
  "https://translate.argosopentech.com/translate",
  "https://translate.terraprint.co/translate",
];

/**
 * Translates text to target language using LibreTranslate API (free)
 * Falls back to original text if translation fails
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'en'
): Promise<string> {
  // If target is same as source, return original
  if (targetLanguage === sourceLanguage) {
    return text;
  }

  // Map language codes
  const sourceCode = TRANSLATION_LANGUAGE_MAP[sourceLanguage] || sourceLanguage;
  const targetCode = TRANSLATION_LANGUAGE_MAP[targetLanguage] || targetLanguage;

  // Try each instance until one succeeds
  for (const instance of LIBRETRANSLATE_INSTANCES) {
    try {
      const response = await fetch(instance, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceCode,
          target: targetCode,
          format: 'text',
        }),
      });

      if (!response.ok) {
        console.warn(`Translation failed with ${instance}: ${response.status}`);
        continue; // Try next instance
      }

      const data = await response.json();
      
      if (data.translatedText) {
        return data.translatedText;
      }
    } catch (error) {
      console.warn(`Translation error with ${instance}:`, error);
      continue; // Try next instance
    }
  }

  // If all instances fail, return original text
  console.error('All translation instances failed, returning original text');
  return text;
}

/**
 * Translates multiple texts in a batch using LibreTranslate
 * Processes in smaller batches to avoid overwhelming the API
 */
export async function translateBatch(
  texts: string[],
  targetLanguage: string,
  sourceLanguage: string = 'en'
): Promise<string[]> {
  if (targetLanguage === sourceLanguage) {
    return texts;
  }

  const results: string[] = [];
  const batchSize = 5; // Process 5 at a time to avoid rate limits

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const promises = batch.map(text => translateText(text, targetLanguage, sourceLanguage));
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Detects the language of given text using LibreTranslate
 * Falls back to English if detection fails
 */
export async function detectLanguage(text: string): Promise<string> {
  // Try LibreTranslate instances for language detection
  for (const instance of LIBRETRANSLATE_INSTANCES) {
    try {
      const detectUrl = instance.replace('/translate', '/detect');
      
      const response = await fetch(detectUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
        }),
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      
      if (data && data[0] && data[0].language) {
        return data[0].language;
      }
    } catch (error) {
      console.warn('Language detection error:', error);
      continue;
    }
  }

  // Default to English if detection fails
  return 'en';
}

// Cache translations to avoid repeated API calls
const translationCache = new Map<string, string>();

/**
 * Cached translation function
 */
export async function translateWithCache(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'en'
): Promise<string> {
  const cacheKey = `${sourceLanguage}:${targetLanguage}:${text}`;
  
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  const translated = await translateText(text, targetLanguage, sourceLanguage);
  translationCache.set(cacheKey, translated);
  
  return translated;
}

// Clear cache when it gets too large
export function clearTranslationCache() {
  translationCache.clear();
}

// Get cache size
export function getTranslationCacheSize(): number {
  return translationCache.size;
}
