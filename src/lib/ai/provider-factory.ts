/**
 * AI Provider Factory
 * 
 * Central factory for creating and managing AI providers.
 * Allows easy switching between different AI models.
 */

import { IAIProvider, AIProvider, AIProvidersConfig } from './types';
import { GeminiProvider } from './providers/gemini';
import { SarvamProvider } from './providers/sarvam';

/**
 * Get the configured AI provider
 */
export function getAIProvider(provider?: AIProvider): IAIProvider {
  const selectedProvider = provider || getDefaultProvider();
  
  switch (selectedProvider) {
    case 'gemini':
      return createGeminiProvider();
    
    case 'sarvam':
      return createSarvamProvider();
    
    // Add more providers here as needed
    // case 'openai':
    //   return createOpenAIProvider();
    
    // case 'claude':
    //   return createClaudeProvider();
    
    default:
      // Fallback to Gemini
      console.warn(`Unknown provider: ${selectedProvider}, falling back to Gemini`);
      return createGeminiProvider();
  }
}

/**
 * Get the default provider from environment variable
 */
export function getDefaultProvider(): AIProvider {
  const envProvider = process.env.NEXT_PUBLIC_AI_PROVIDER as AIProvider;
  return envProvider || 'gemini';
}

/**
 * Create Gemini provider instance
 */
function createGeminiProvider(): GeminiProvider {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  const model = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.0-flash-exp';
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }
  
  return new GeminiProvider(apiKey, model);
}

/**
 * Create Sarvam provider instance
 */
function createSarvamProvider(): SarvamProvider {
  const apiKey = process.env.NEXT_PUBLIC_SARVAM_API_KEY || '';
  const model = process.env.NEXT_PUBLIC_SARVAM_MODEL || 'sarvam-2b';
  const endpoint = process.env.NEXT_PUBLIC_SARVAM_ENDPOINT;
  
  if (!apiKey) {
    throw new Error('Sarvam API key not configured');
  }
  
  return new SarvamProvider(apiKey, model, endpoint);
}

/**
 * Check which providers are available
 */
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = [];
  
  try {
    const gemini = createGeminiProvider();
    if (gemini.isAvailable()) providers.push('gemini');
  } catch (e) {
    // Gemini not available
  }
  
  try {
    const sarvam = createSarvamProvider();
    if (sarvam.isAvailable()) providers.push('sarvam');
  } catch (e) {
    // Sarvam not available
  }
  
  return providers;
}

/**
 * Get provider configuration
 */
export function getProviderConfig(): AIProvidersConfig {
  return {
    gemini: {
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
      model: process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.0-flash-exp',
      maxTokens: 800,
      temperature: 0.7,
    },
    sarvam: {
      apiKey: process.env.NEXT_PUBLIC_SARVAM_API_KEY || '',
      model: process.env.NEXT_PUBLIC_SARVAM_MODEL || 'sarvam-2b',
      endpoint: process.env.NEXT_PUBLIC_SARVAM_ENDPOINT || 'https://api.sarvam.ai/v1/chat/completions',
      maxTokens: 800,
      temperature: 0.7,
    },
  };
}
