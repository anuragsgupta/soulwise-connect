# Translation System Documentation

## Overview

This application uses a hybrid translation approach combining static translations with dynamic API-based translation using **LibreTranslate** - a free and open-source translation API.

## Features

- ✅ **Completely Free** - Uses LibreTranslate public instances
- ✅ **Multiple Fallback Servers** - Automatic failover if one instance is down
- ✅ **Caching** - Translations are cached to avoid repeated API calls
- ✅ **Batch Translation** - Efficiently translate multiple texts at once
- ✅ **11 Supported Languages** - English, Hindi, Marathi, Bengali, Telugu, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Odia

## Architecture

### Static Translations
Located in `/src/locales/translations.ts`, these are pre-translated common UI elements that don't require API calls.

### Dynamic Translation
For user-generated content or dynamic text, the system uses LibreTranslate API with automatic fallback to multiple instances.

## Usage

### 1. Using the Hook (Recommended)

```tsx
import { useTranslate } from '@/hooks/useTranslate';

function MyComponent() {
  const { translate, translateMultiple, isTranslating } = useTranslate();
  
  const handleTranslate = async () => {
    const result = await translate("Hello World");
    console.log(result);
  };
  
  // For multiple texts
  const translateList = async () => {
    const results = await translateMultiple(["Hello", "World", "Welcome"]);
    console.log(results);
  };
  
  return (
    <div>
      {isTranslating && <p>Translating...</p>}
    </div>
  );
}
```

### 2. Using the Auto-Translate Hook

```tsx
import { useAutoTranslate } from '@/hooks/useTranslate';

function MyComponent({ dynamicText }: { dynamicText: string }) {
  const { translatedText, loading } = useAutoTranslate(dynamicText);
  
  return (
    <div>
      {loading ? <Skeleton /> : <p>{translatedText}</p>}
    </div>
  );
}
```

### 3. Using the TranslatedText Component

```tsx
import TranslatedText from '@/components/translation/TranslatedText';

function MyComponent() {
  return (
    <div>
      <TranslatedText 
        text="Hello World" 
        translationKey="welcome"
        as="h1"
        className="text-2xl font-bold"
      />
    </div>
  );
}
```

### 4. Direct API Usage

```tsx
import { translateText, translateBatch } from '@/lib/translation';

// Single translation
const result = await translateText("Hello", "hi", "en");

// Batch translation
const results = await translateBatch(
  ["Hello", "World", "Welcome"],
  "hi",
  "en"
);
```

## LibreTranslate Instances

The system automatically tries these public instances in order:

1. `https://libretranslate.com/translate` (Primary)
2. `https://translate.argosopentech.com/translate` (Fallback 1)
3. `https://translate.terraprint.co/translate` (Fallback 2)

If all instances fail, the system returns the original text.

## Performance Optimization

### Caching
All translations are cached in memory to avoid repeated API calls. Cache can be managed via:

```typescript
import { clearTranslationCache, getTranslationCacheSize } from '@/lib/translation';

// Check cache size
const size = getTranslationCacheSize();

// Clear cache if needed
clearTranslationCache();
```

### Batch Processing
When translating multiple texts, the system automatically batches requests in groups of 5 to avoid overwhelming the API.

## Language Codes

| Language | Code |
|----------|------|
| English  | en   |
| Hindi    | hi   |
| Marathi  | mr   |
| Bengali  | bn   |
| Telugu   | te   |
| Tamil    | ta   |
| Gujarati | gu   |
| Kannada  | kn   |
| Malayalam| ml   |
| Punjabi  | pa   |
| Odia     | or   |

## Best Practices

1. **Use Static Translations First**: For common UI elements, always use static translations from `/src/locales/translations.ts`

2. **Batch When Possible**: If translating multiple texts, use `translateBatch` or `translateMultiple` instead of individual calls

3. **Handle Fallbacks**: Always show original text if translation fails

4. **Cache Management**: Monitor cache size in production and clear periodically if needed

5. **Loading States**: Show loading indicators during translation for better UX

## Error Handling

The system is designed to gracefully handle failures:
- If translation fails, returns original text
- Automatically tries fallback instances
- Logs warnings for debugging (visible in console)

## Limitations

- **Rate Limits**: Public LibreTranslate instances may have rate limits
- **Quality**: Machine translation may not be perfect for complex or context-dependent text
- **Network Dependency**: Requires internet connection for dynamic translation

## Alternative Setup (Google Translate)

If you want to use Google Translate instead (paid), update `/src/lib/translation.ts` and add:

```env
NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_api_key_here
```

## Troubleshooting

### Translations not working?
1. Check browser console for errors
2. Verify network connectivity
3. Try a different LibreTranslate instance manually
4. Check if cache is too large and clear it

### Slow translations?
1. Use static translations for common text
2. Implement batch translation for lists
3. Add loading states to improve perceived performance
4. Consider pre-translating content server-side

## Future Enhancements

- [ ] Server-side translation for SEO
- [ ] Translation memory/glossary for consistent terminology
- [ ] Progressive translation (show cached first, update when fresh translation arrives)
- [ ] Offline translation support
- [ ] Custom translation model training for domain-specific content
