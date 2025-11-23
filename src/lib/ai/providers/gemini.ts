/**
 * Gemini AI Provider Implementation
 * 
 * Implements the IAIProvider interface for Google's Gemini model
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  IAIProvider,
  AIRequest,
  AIResponse,
  SentimentLabel,
  RiskLevel,
  EmotionScores,
} from '../types';
import { analyzeSentiment, detectEmotions, assessRiskLevel } from '../sentiment-analyzer';
import { buildGeminiPromptToon } from '../toon-prompts';

export class GeminiProvider implements IAIProvider {
  name = 'gemini' as const;
  private client: GoogleGenerativeAI;
  private model: any;
  private apiKey: string;

  constructor(apiKey: string, modelName: string = 'gemini-2.0-flash-exp') {
    this.apiKey = apiKey;
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: 2048,  // Increased for longer responses
        temperature: 0.7,
      },
    });
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    try {
      // Get the user's last message
      const userMessage = request.messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
      
      // Build Toon-formatted prompt (token-efficient)
      const fullPrompt = buildGeminiPromptToon(userMessage);
      
      console.log('🎨 Using Toon format prompt (token-efficient)');

      // Generate response
      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      const message = response.text();

      // Analyze sentiment and emotions
      const sentiment = await this.analyzeSentiment(userMessage);
      const emotions = await this.detectEmotions(userMessage);
      const riskLevel = await this.assessRisk(userMessage, emotions);

      return {
        message,
        sentiment,
        emotions,
        riskLevel,
        crisisDetected: riskLevel === 'severe',
        provider: 'gemini',
        tokensUsed: response.usageMetadata?.totalTokenCount,
      };
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      throw new Error(`Gemini provider error: ${error.message}`);
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
    return !!this.apiKey && this.apiKey !== 'your-gemini-api-key';
  }

  private buildSystemPrompt(): string {
    return `You are Mann Mitra, an empathetic AI mental health companion for college students in India.

Core Guidelines:
- Provide supportive, non-judgmental responses
- Use warm, conversational language
- Keep responses under 150 words
- Focus on emotional support and practical coping strategies
- Reference Indian cultural context when relevant
- Encourage professional help for serious concerns

Response Style:
✓ Empathetic and understanding
✓ Practical and actionable advice
✓ Culturally sensitive
✗ No medical diagnosis
✗ No emergency instructions (system handles this)`;
  }
}
