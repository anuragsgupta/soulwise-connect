/**
 * Sarvam AI Provider Implementation
 * 
 * Implements the IAIProvider interface for Sarvam AI models
 * Documentation: https://docs.sarvam.ai/
 */

import {
  IAIProvider,
  AIRequest,
  AIResponse,
  SentimentLabel,
  RiskLevel,
  EmotionScores,
} from '../types';
import { analyzeSentiment, detectEmotions, assessRiskLevel } from '../sentiment-analyzer';
import { buildSarvamPromptToon } from '../toon-prompts';

export class SarvamProvider implements IAIProvider {
  name = 'sarvam' as const;
  private apiKey: string;
  private endpoint: string;
  private model: string;

  constructor(
    apiKey: string,
    model: string = 'sarvam-2b',
    endpoint: string = 'https://api.sarvam.ai/v1/chat/completions'
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.endpoint = endpoint;
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    try {
      // Get the user's last message
      const userMessage = request.messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
      
      // Build Toon-formatted system prompt (token-efficient, Hindi/English support)
      const systemPrompt = buildSarvamPromptToon(userMessage);
      
      console.log('🎨 Using Toon format prompt for Sarvam AI (token-efficient)');
      
      // Build messages for Sarvam API
      const messages = [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...request.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      ];

      // Call Sarvam API
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: request.maxTokens || 800,
          temperature: request.temperature || 0.7,
          language: 'hi-IN', // Sarvam supports Hindi and Indian languages
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Sarvam API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      const message = data.choices[0]?.message?.content || '';

      // Analyze sentiment and emotions (using userMessage from earlier)
      const sentiment = await this.analyzeSentiment(userMessage);
      const emotions = await this.detectEmotions(userMessage);
      const riskLevel = await this.assessRisk(userMessage, emotions);

      return {
        message,
        sentiment,
        emotions,
        riskLevel,
        crisisDetected: riskLevel === 'severe',
        provider: 'sarvam',
        tokensUsed: data.usage?.total_tokens,
      };
    } catch (error: any) {
      console.error('Sarvam API Error:', error);
      throw new Error(`Sarvam provider error: ${error.message}`);
    }
  }

  async analyzeSentiment(message: string): Promise<{ label: SentimentLabel; score: number }> {
    return analyzeSentiment(message);
  }

  async detectEmotions(message: string): Promise<EmotionScores> {
    return detectEmotions(message);
  }

  async assessRisk(message: string, emotions: EmotionScores): Promise<RiskLevel> {
    return assessRiskLevel(message, emotions);
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey !== 'your-sarvam-api-key';
  }

  private buildSystemPrompt(): string {
    return `आप मन मित्र हैं, भारतीय कॉलेज छात्रों के लिए एक सहानुभूतिपूर्ण AI मानसिक स्वास्थ्य साथी।

You are Mann Mitra, an empathetic AI mental health companion for college students in India.

Core Guidelines:
- Provide supportive, non-judgmental responses in Hindi or English
- Use warm, conversational language
- Keep responses under 150 words
- Focus on emotional support and practical coping strategies
- Reference Indian cultural context when relevant
- Encourage professional help for serious concerns
- Support multilingual conversations (Hindi, English, Hinglish)

Response Style:
✓ Empathetic and understanding
✓ Practical and actionable advice
✓ Culturally sensitive to Indian context
✓ Can respond in Hindi, English, or Hinglish
✗ No medical diagnosis
✗ No emergency instructions (system handles this)

भारतीय संदर्भ:
- परिवार और सामाजिक दबाव को समझें
- शैक्षणिक तनाव पर ध्यान दें
- भारतीय मानसिकता के अनुरूप सलाह दें`;
  }
}
