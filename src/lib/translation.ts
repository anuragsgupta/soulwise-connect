// Translation utility for dynamic content translation
// Uses Google Translate API or similar service for real-time translation

export interface TranslationRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface TranslationResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
}

/**
 * Translates text to target language using Google Translate API
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

  try {
    // Check if we have Google Cloud Translation API key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
    
    if (!apiKey) {
      console.warn('Translation API key not configured, returning original text');
      return text;
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
        source: sourceLanguage,
        format: 'text',
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original text
  }
}

/**
 * Translates multiple texts in a batch
 */
export async function translateBatch(
  texts: string[],
  targetLanguage: string,
  sourceLanguage: string = 'en'
): Promise<string[]> {
  if (targetLanguage === sourceLanguage) {
    return texts;
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
    
    if (!apiKey) {
      return texts;
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: texts,
        target: targetLanguage,
        source: sourceLanguage,
        format: 'text',
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data.translations.map((t: { translatedText: string }) => t.translatedText);
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts;
  }
}

/**
 * Detects the language of given text
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
    
    if (!apiKey) {
      return 'en'; // Default to English
    }

    const url = `https://translation.googleapis.com/language/translate/v2/detect?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Language detection error: ${response.status}`);
    }

    const data = await response.json();
    return data.data.detections[0][0].language;
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en';
  }
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
