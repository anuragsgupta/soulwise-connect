/**
 * Mann Mitra - Theme Color Palette
 * Inspired by the provided design palette image
 * 
 * Color scheme for mental health and wellness platform
 * Combining calming blues with warm, approachable tones
 */

export const colorPalette = {
  // Primary Blues - Calming, Professional
  turquoise: {
    hex: '#447F88',
    rgb: 'rgb(68, 127, 152)',
    cmyk: 'cmyk(55%, 16%, 0%, 40%)',
    description: 'Primary brand color - Trust and calm',
    use: 'Headers, primary buttons, key UI elements',
  },
  
  slateBlue: {
    hex: '#629BB5',
    rgb: 'rgb(98, 155, 182)',
    cmyk: 'cmyk(46%, 15%, 0%, 29%)',
    description: 'Secondary blue - Supportive',
    use: 'Secondary buttons, links, accents',
  },
  
  // Neutral Tones - Clean, Professional
  platinum: {
    hex: '#D4DEE1',
    rgb: 'rgb(218, 222, 237)',
    cmyk: 'cmyk(8%, 6%, 0%, 7%)',
    description: 'Light neutral - Backgrounds',
    use: 'Card backgrounds, subtle dividers',
  },
  
  glacier: {
    hex: '#B9DBE1',
    rgb: 'rgb(185, 219, 225)',
    cmyk: 'cmyk(18%, 3%, 0%, 12%)',
    description: 'Cool light blue - Soft highlights',
    use: 'Hover states, light accents',
  },
  
  iceBlue: {
    hex: '#D8E8F3',
    rgb: 'rgb(214, 235, 243)',
    cmyk: 'cmyk(12%, 3%, 0%, 5%)',
    description: 'Very light blue - Subtle backgrounds',
    use: 'Section backgrounds, cards',
  },
} as const;

/**
 * Theme configuration for dark and light modes
 */
export const themeColors = {
  light: {
    primary: colorPalette.turquoise.hex,
    secondary: colorPalette.slateBlue.hex,
    background: '#FFFFFF',
    surface: colorPalette.platinum.hex,
    accent: colorPalette.glacier.hex,
    text: {
      primary: '#0F3B45',
      secondary: '#4A6B73',
      muted: '#8FA5AC',
    },
  },
  dark: {
    primary: '#6BC5CF',
    secondary: '#8FB8CF',
    background: '#0F1923',
    surface: '#1A2530',
    accent: '#2A3F4A',
    text: {
      primary: '#E8EFF5',
      secondary: '#B8C8D2',
      muted: '#7A8E99',
    },
  },
} as const;

/**
 * Usage examples and semantic color mapping
 */
export const semanticColors = {
  // Status colors
  success: {
    light: '#10B981', // Green
    dark: '#34D399',
  },
  warning: {
    light: '#F59E0B', // Amber
    dark: '#FBBF24',
  },
  error: {
    light: '#EF4444', // Red
    dark: '#F87171',
  },
  info: {
    light: colorPalette.slateBlue.hex,
    dark: '#7DD3FC',
  },
  
  // Mental health specific
  calm: colorPalette.glacier.hex,
  focused: colorPalette.turquoise.hex,
  supportive: colorPalette.slateBlue.hex,
  gentle: colorPalette.iceBlue.hex,
} as const;

/**
 * Gradient combinations for backgrounds and cards
 */
export const gradients = {
  hero: {
    light: `linear-gradient(135deg, ${colorPalette.iceBlue.hex} 0%, ${colorPalette.glacier.hex} 100%)`,
    dark: `linear-gradient(135deg, #1A2530 0%, #0F1923 100%)`,
  },
  card: {
    light: `linear-gradient(180deg, #FFFFFF 0%, ${colorPalette.platinum.hex} 100%)`,
    dark: `linear-gradient(180deg, #1A2530 0%, #0F1923 100%)`,
  },
  button: {
    light: `linear-gradient(135deg, ${colorPalette.turquoise.hex} 0%, ${colorPalette.slateBlue.hex} 100%)`,
    dark: `linear-gradient(135deg, #6BC5CF 0%, #8FB8CF 100%)`,
  },
} as const;

/**
 * Design tokens for consistent spacing, shadows, and borders
 */
export const designTokens = {
  shadows: {
    sm: '0 1px 2px 0 rgba(68, 127, 152, 0.05)',
    md: '0 4px 6px -1px rgba(68, 127, 152, 0.1)',
    lg: '0 10px 15px -3px rgba(68, 127, 152, 0.1)',
    xl: '0 20px 25px -5px rgba(68, 127, 152, 0.1)',
  },
  borders: {
    light: colorPalette.platinum.hex,
    medium: colorPalette.glacier.hex,
    strong: colorPalette.slateBlue.hex,
  },
  borderRadius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    full: '9999px',   // Fully rounded
  },
} as const;

/**
 * CSS Custom Properties Generator
 * Use this to generate CSS variables for the theme
 */
export function generateCSSVariables(mode: 'light' | 'dark') {
  const colors = themeColors[mode];
  
  return `
    --color-primary: ${colors.primary};
    --color-secondary: ${colors.secondary};
    --color-background: ${colors.background};
    --color-surface: ${colors.surface};
    --color-accent: ${colors.accent};
    --color-text-primary: ${colors.text.primary};
    --color-text-secondary: ${colors.text.secondary};
    --color-text-muted: ${colors.text.muted};
  `;
}

/**
 * Tailwind CSS color extension
 * Add this to tailwind.config.ts
 */
export const tailwindColors = {
  'mann-turquoise': colorPalette.turquoise.hex,
  'mann-slate': colorPalette.slateBlue.hex,
  'mann-platinum': colorPalette.platinum.hex,
  'mann-glacier': colorPalette.glacier.hex,
  'mann-ice': colorPalette.iceBlue.hex,
};

/**
 * Color accessibility checker
 * Ensures WCAG AA compliance for text contrast
 * Note: This is a placeholder. Use a proper library like 'color-contrast-checker' in production
 */
export function checkContrast(_foreground: string, _background: string): {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
} {
  // This is a simplified version. Use a proper library for production
  // Recommended: polished or color-contrast-checker
  return {
    ratio: 4.5, // Placeholder
    wcagAA: true,
    wcagAAA: false,
  };
}

/**
 * Usage Guide:
 * 
 * 1. In CSS/Tailwind:
 *    className="bg-mann-glacier text-mann-turquoise"
 * 
 * 2. In styled-components:
 *    background: ${colorPalette.glacier.hex};
 * 
 * 3. For gradients:
 *    background: ${gradients.hero.light};
 * 
 * 4. With theme:
 *    const colors = themeColors[theme];
 */
