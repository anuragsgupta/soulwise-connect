/**
 * Theme and Language Hook Examples
 * 
 * This file demonstrates how to use theme and language features
 * across different components in the Mann Mitra application.
 */

import { useTheme } from 'next-themes';
import { useLanguage, SupportedLanguage } from '@/contexts/LanguageContext';
import { translateText } from '@/lib/translation';
import * as React from 'react';

// ============================================
// EXAMPLE 1: Simple Theme Toggle Button
// ============================================
export function ThemeToggleExample() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}

// ============================================
// EXAMPLE 2: Language Selector Dropdown
// ============================================
export function LanguageDropdownExample() {
  const { language, languages, setLanguage } = useLanguage();
  
  return (
    <select 
      value={language} 
      onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.nativeName}
        </option>
      ))}
    </select>
  );
}

// ============================================
// EXAMPLE 3: Using Static Translations
// ============================================
export function TranslatedHeaderExample() {
  const { t, language } = useLanguage();
  
  return (
    <div>
      <h1>{t('welcome', 'Welcome')}</h1>
      <p>{t('dashboard', 'Dashboard')}</p>
      <button>{t('save', 'Save')}</button>
      <span>Current: {language}</span>
    </div>
  );
}

// ============================================
// EXAMPLE 4: Dynamic Content Translation
// ============================================
export function DynamicTranslationExample() {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = React.useState('');
  
  const handleTranslate = async (text: string) => {
    const result = await translateText(text, language, 'en');
    setTranslatedText(result);
  };
  
  return (
    <div>
      <input 
        type="text" 
        placeholder="Enter text to translate"
        onChange={(e) => handleTranslate(e.target.value)}
      />
      <p>Translated: {translatedText}</p>
    </div>
  );
}

// ============================================
// EXAMPLE 5: Theme-Aware Component
// ============================================
export function ThemedCardExample() {
  const { theme } = useTheme();
  
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
      <h2 className="text-gray-900 dark:text-gray-100">
        Card Title
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        This card adapts to {theme} theme
      </p>
    </div>
  );
}

// ============================================
// EXAMPLE 6: Combined Theme & Language
// ============================================
export function FullFeatureExample() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {t('settings', 'Settings')}
      </h1>
      
      {/* Theme Switcher */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          {t('theme', 'Theme')}
        </label>
        <div className="flex gap-2">
          <button 
            onClick={() => setTheme('light')}
            className={`px-4 py-2 rounded ${
              theme === 'light' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {t('light', 'Light')}
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className={`px-4 py-2 rounded ${
              theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {t('dark', 'Dark')}
          </button>
        </div>
      </div>
      
      {/* Language Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('language', 'Language')}
        </label>
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
          className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800"
        >
          <option value="en">🇬🇧 English</option>
          <option value="hi">🇮🇳 हिन्दी</option>
          <option value="mr">🇮🇳 मराठी</option>
          <option value="bn">🇮🇳 বাংলা</option>
          <option value="te">🇮🇳 తెలుగు</option>
          <option value="ta">🇮🇳 தமிழ்</option>
        </select>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 7: Chat Message with Translation
// ============================================
export function TranslatedChatMessage({ message }: { message: string }) {
  const { language } = useLanguage();
  const [translated, setTranslated] = React.useState(message);
  
  React.useEffect(() => {
    if (language !== 'en') {
      translateText(message, language, 'en').then(setTranslated);
    } else {
      setTranslated(message);
    }
  }, [message, language]);
  
  return (
    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
      <p className="text-gray-900 dark:text-gray-100">{translated}</p>
      {language !== 'en' && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Original: {message}
        </p>
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 8: Responsive Settings Panel
// ============================================
export function ResponsiveSettingsPanel() {
  const { theme, setTheme } = useTheme();
  const { language, languages, setLanguage, t } = useLanguage();
  
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t('settings', 'Settings')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('preferences', 'Preferences')}
        </p>
      </div>
      
      {/* Theme Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {t('appearance', 'Appearance')}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {['light', 'dark', 'system'].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`p-4 rounded-lg border-2 transition ${
                theme === t
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {t === 'light' && '☀️'}
              {t === 'dark' && '🌙'}
              {t === 'system' && '🖥️'}
              <div className="text-sm mt-2">{t}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Language Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {t('language', 'Language')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`p-3 rounded-lg border-2 transition text-left ${
                language === lang.code
                  ? 'border-green-600 bg-green-50 dark:bg-green-900'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <div className="text-2xl mb-1">{lang.flag}</div>
              <div className="text-sm font-medium">{lang.nativeName}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {lang.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Note: Import React at top of actual component file
