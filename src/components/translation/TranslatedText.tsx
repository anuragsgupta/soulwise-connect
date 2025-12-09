"use client";

import { useAutoTranslate } from "@/hooks/useTranslate";

interface TranslatedTextProps {
  text: string;
  translationKey?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  fallback?: string;
}

/**
 * Component that automatically translates text based on current language
 * Usage: <TranslatedText text="Hello World" translationKey="welcome" />
 */
export default function TranslatedText({
  text,
  translationKey,
  className,
  as: Component = "span",
  fallback,
}: TranslatedTextProps) {
  const { translatedText, loading } = useAutoTranslate(text, translationKey);

  if (loading && fallback) {
    return <Component className={className}>{fallback}</Component>;
  }

  if (loading) {
    return (
      <Component className={className}>
        {text}
      </Component>
    );
  }

  return <Component className={className}>{translatedText}</Component>;
}
