/**
 * 🎨 Dynamic Font Configuration for Mann Mitra
 * 
 * This configuration makes it super easy to switch fonts throughout the app.
 * Just change the font names here and the entire app updates!
 * 
 * Usage:
 * 1. Change ACTIVE_FONT_SET to switch between preset combinations
 * 2. Or modify CUSTOM_FONTS to create your own combination
 * 3. Import fontConfig in components to use programmatically
 */

import { Poppins, Inter, Quicksand, Outfit, DM_Sans, Plus_Jakarta_Sans, Manrope, Space_Grotesk } from 'next/font/google';

// ============================================
// 📦 FONT PRESET DEFINITIONS
// ============================================

/**
 * Option 1: Calm & Professional (Recommended for Mental Health)
 * Perfect balance of warmth, readability, and trust
 */
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
});

export const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-accent',
  display: 'swap',
});

/**
 * Option 2: Friendly & Approachable
 * Best for younger audience - playful yet professional
 */
export const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
});

export const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

/**
 * Option 3: Elegant & Calming
 * Premium feel - sophisticated mental wellness
 */
export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
});

export const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-accent',
  display: 'swap',
});

// ============================================
// 🎯 FONT SET CONFIGURATIONS
// ============================================

export const FONT_PRESETS = {
  /**
   * Option 1: Perfect for mental health apps
   * Warm, readable, trustworthy
   */
  option1: {
    name: 'Calm & Professional',
    description: 'Perfect for mental health apps - warm, readable, trustworthy',
    heading: poppins,
    body: inter,
    accent: quicksand,
    headingName: 'Poppins',
    bodyName: 'Inter',
    accentName: 'Quicksand',
  },
  
  /**
   * Option 2: Friendly approach
   * Modern, friendly, versatile
   */
  option2: {
    name: 'Friendly & Approachable',
    description: 'Best for younger audience - playful yet professional',
    heading: outfit,
    body: dmSans,
    accent: quicksand, // Reuse Quicksand for consistency
    headingName: 'Outfit',
    bodyName: 'DM Sans',
    accentName: 'Quicksand',
  },
  
  /**
   * Option 3: Premium feel
   * Elegant, sophisticated, calming
   */
  option3: {
    name: 'Elegant & Calming',
    description: 'Premium feel - sophisticated mental wellness',
    heading: plusJakartaSans,
    body: manrope,
    accent: spaceGrotesk,
    headingName: 'Plus Jakarta Sans',
    bodyName: 'Manrope',
    accentName: 'Space Grotesk',
  },
} as const;

// ============================================
// ⚙️ ACTIVE CONFIGURATION
// ============================================

/**
 * 🔥 CHANGE THIS TO SWITCH FONT SETS INSTANTLY!
 * 
 * Options: 'option1' | 'option2' | 'option3'
 * 
 * - option1: Poppins + Inter + Quicksand (Recommended)
 * - option2: Outfit + DM Sans + Quicksand
 * - option3: Plus Jakarta Sans + Manrope + Space Grotesk
 */
export const ACTIVE_FONT_SET: keyof typeof FONT_PRESETS = 'option1';

/**
 * Get the currently active font configuration
 */
export const activeFonts = FONT_PRESETS[ACTIVE_FONT_SET];

/**
 * Export individual fonts for use in layout
 */
export const fontHeading = activeFonts.heading;
export const fontBody = activeFonts.body;
export const fontAccent = activeFonts.accent;

// ============================================
// 📊 FONT CONFIGURATION METADATA
// ============================================

/**
 * Font configuration for easy programmatic access
 * Use this in components that need to know font details
 */
export const fontConfig = {
  current: ACTIVE_FONT_SET,
  name: activeFonts.name,
  description: activeFonts.description,
  fonts: {
    heading: {
      name: activeFonts.headingName,
      variable: '--font-heading',
      className: 'font-heading',
    },
    body: {
      name: activeFonts.bodyName,
      variable: '--font-body',
      className: 'font-body',
    },
    accent: {
      name: activeFonts.accentName,
      variable: '--font-accent',
      className: 'font-accent',
    },
  },
  usage: {
    heading: 'Use for h1, h2, h3, h4, h5, h6 tags and important titles',
    body: 'Use for paragraphs, descriptions, and general text content',
    accent: 'Use for buttons, CTAs, and interactive elements',
  },
} as const;

// ============================================
// 🎨 CSS VARIABLE GENERATOR
// ============================================

/**
 * Generate CSS variable string for use in className
 * This is used in the root layout
 */
export function getFontVariables(): string {
  return `${fontHeading.variable} ${fontBody.variable} ${fontAccent.variable}`;
}

/**
 * Get font class names for specific use cases
 */
export const fontClasses = {
  heading: 'font-heading',
  body: 'font-body',
  accent: 'font-accent',
  default: 'font-body', // Default to body font
} as const;

// ============================================
// 📖 USAGE EXAMPLES
// ============================================

/**
 * Example Usage in Components:
 * 
 * import { fontClasses } from '@/config/fonts';
 * 
 * // For headings
 * <h1 className={`${fontClasses.heading} text-4xl font-bold`}>
 *   Hello World
 * </h1>
 * 
 * // For body text (default)
 * <p className={`${fontClasses.body} text-base`}>
 *   This is body text
 * </p>
 * 
 * // For buttons
 * <button className={`${fontClasses.accent} font-medium`}>
 *   Click Me
 * </button>
 */

/**
 * Example: Switch fonts easily
 * 
 * Step 1: Change ACTIVE_FONT_SET above to 'option2' or 'option3'
 * Step 2: Rebuild your app: npm run build
 * Step 3: All fonts update automatically across the entire app! 🎉
 */
