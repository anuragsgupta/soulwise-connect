# 🚀 Quick Start: Language & Theme Settings

## ✅ What's Done

### Theme Switching
- ☑️ Light/Dark/System mode toggle
- ☑️ Persistent theme preference
- ☑️ Smooth transitions
- ☑️ Dark mode CSS ready

### Multilingual Support
- ☑️ 11 Indian languages + English
- ☑️ Native language names (हिन्दी, தமிழ், etc.)
- ☑️ Auto-detect browser language
- ☑️ Persistent language preference
- ☑️ Static UI translations

## 🎯 How to Use

### Access Settings
1. Login to your account
2. Click on **Settings** in the dashboard
3. You'll see three sections:
   - **Appearance** (Theme)
   - **Language** (UI Language)
   - **API Key** (Gemini)

### Change Theme
Click one of three buttons:
- ☀️ **Light** - Bright theme
- 🌙 **Dark** - Dark theme
- 🖥️ **System** - Follows device

### Change Language
Select from dropdown:
- 🇬🇧 English
- 🇮🇳 हिन्दी (Hindi)
- 🇮🇳 मराठी (Marathi)
- 🇮🇳 বাংলা (Bengali)
- 🇮🇳 తెలుగు (Telugu)
- 🇮🇳 தமிழ் (Tamil)
- 🇮🇳 ગુજરાતી (Gujarati)
- 🇮🇳 ಕನ್ನಡ (Kannada)
- 🇮🇳 മലയാളം (Malayalam)
- 🇮🇳 ਪੰਜਾਬੀ (Punjabi)
- 🇮🇳 ଓଡ଼ିଆ (Odia)

## 💻 For Developers

### Use Theme in Component
```tsx
import { useTheme } from 'next-themes';

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme('dark')}>
      Dark Mode
    </button>
  );
}
```

### Use Language in Component
```tsx
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div>
      <h1>{t('welcome', 'Welcome')}</h1>
      <button onClick={() => setLanguage('hi')}>हिन्दी</button>
    </div>
  );
}
```

### Add New Translation Key
Edit `/src/locales/translations.ts`:
```typescript
export type TranslationKey = 
  | 'settings'
  | 'my_new_key'  // Add here
  // ...

export const translations = {
  en: {
    settings: 'Settings',
    my_new_key: 'My Text',
    // ...
  },
  hi: {
    settings: 'सेटिंग्स',
    my_new_key: 'मेरा पाठ',
    // ...
  },
  // ... repeat for all languages
};
```

### Dynamic Translation (API)
```tsx
import { translateText } from '@/lib/translation';

// Translate user input or AI response
const translated = await translateText(
  'Hello, how are you?',
  'hi', // target language
  'en'  // source language
);
// Output: "नमस्ते, आप कैसे हैं?"
```

## 🔧 Configuration

### Optional: Google Translate API
For dynamic content translation, add to `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_key_here
```

**Note**: Static UI works without API key!

## 📁 File Structure
```
src/
├── app/
│   └── layout.tsx                    # Providers integrated
├── components/
│   ├── dashboard/
│   │   └── Settings.tsx              # UI with theme & language
│   └── providers/
│       └── ThemeProvider.tsx         # Theme wrapper
├── contexts/
│   └── LanguageContext.tsx           # Language state
├── lib/
│   └── translation.ts                # Dynamic translation
└── locales/
    └── translations.ts               # Static translations
```

## 🎨 Theme Classes

Use Tailwind dark mode classes:
```tsx
<div className="bg-white dark:bg-gray-900">
  <h1 className="text-gray-900 dark:text-gray-100">
    Title
  </h1>
</div>
```

## 📱 Testing Checklist

- [ ] Theme changes immediately when clicked
- [ ] Theme persists after page reload
- [ ] Language dropdown shows all languages
- [ ] UI elements translate when language changes
- [ ] Language persists after page reload
- [ ] Dark mode colors look good
- [ ] No hydration errors

## 🐛 Troubleshooting

### Theme Not Working
- Check `suppressHydrationWarning` in `<html>` tag
- Ensure ThemeProvider wraps app
- Clear localStorage and try again

### Language Not Working
- Ensure LanguageProvider wraps app
- Check translation keys match
- Verify import paths

### Translations Missing
- Add key to TranslationKey type
- Add translations for all languages
- Use fallback: `t('key', 'Fallback')`

## 🎯 Next Steps

1. ✅ Theme & Language UI complete
2. 🔄 Translate more components
3. 🔄 Add RTL support for appropriate languages
4. 🔄 AI response translation
5. 🔄 Voice input in native language

---

**Status**: ✅ Production Ready
**Last Updated**: December 2025
