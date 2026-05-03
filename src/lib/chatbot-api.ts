/**
 * Chatbot API utilities
 * Handles communication with the chatbot API, including passing stored API keys
 */

import { getGeminiApiKey } from '@/lib/indexedDB/apiKeyStore';

export interface ChatbotRequest {
  userId?: string;
  sessionId?: string;
  message: string;
  messageHistory?: Array<{ role: string; content: string }>;
}

export interface ChatbotResponse {
  success: boolean;
  message?: string;
  error?: string;
  hint?: string;
  timestamp?: string;
  crisisLevel?: string;
  smsAlertSent?: boolean;
  truncated?: boolean;
  fallback?: boolean;
  safetyFiltered?: boolean;
  sentiment?: {
    label: string;
    score: number;
    emotions: Record<string, number>;
    riskLevel: string;
  };
}

/**
 * Send a message to the chatbot API
 * Automatically includes Gemini API key from IndexedDB if available
 */
export async function sendChatbotMessage(request: ChatbotRequest): Promise<ChatbotResponse> {
  try {
    // Try to get Gemini API key from IndexedDB
    let apiKey: string | null = null;
    try {
      apiKey = await getGeminiApiKey();
      if (apiKey) {
        console.log('✅ Using Gemini API key from IndexedDB');
      }
    } catch (error) {
      console.warn('⚠️ Could not retrieve API key from IndexedDB:', error);
      // Continue anyway - server might have env var configured
    }

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add Gemini API key if available
    if (apiKey) {
      headers['x-gemini-api-key'] = apiKey;
    }

    // Make the request
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    // Parse response
    const data = (await response.json()) as ChatbotResponse;

    if (!response.ok) {
      console.error('❌ Chatbot API error:', data.error || 'Unknown error');
      console.error('   Hint:', data.hint);
      throw new Error(data.error || `API error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('❌ Error sending message to chatbot:', error);
    throw error;
  }
}

/**
 * Check if API key is configured (either in IndexedDB or environment)
 */
export async function isChatbotConfigured(): Promise<boolean> {
  try {
    const hasKey = await getGeminiApiKey();
    return !!hasKey;
  } catch (error) {
    console.warn('⚠️ Error checking chatbot configuration:', error);
    // Return true assuming server has env var configured
    return true;
  }
}
