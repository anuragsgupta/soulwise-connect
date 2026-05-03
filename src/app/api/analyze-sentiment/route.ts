import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface AnalyzeTextRequest {
  text: string;
  emotions?: string[];
  moodLevel?: number;
}

interface SentimentResult {
  score: number; // -1 to 1
  label: string; // 'positive', 'negative', 'neutral'
  confidence: number;
  analysis: string;
}

/**
 * Analyze sentiment of text using Google Gemini AI
 * POST /api/analyze-sentiment
 * Returns a sentiment score from -1 (very negative) to 1 (very positive)
 */
export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeTextRequest = await request.json();
    const { text, emotions = [], moodLevel } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Text is required for sentiment analysis' 
        },
        { status: 400 }
      );
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      // Return a basic sentiment based on mood level and emotions if available
      const fallbackScore = calculateFallbackSentiment(moodLevel, emotions);
      return NextResponse.json({
        success: true,
        data: {
          score: fallbackScore,
          label: getSentimentLabel(fallbackScore),
          confidence: 0.5,
          analysis: 'Basic sentiment analysis (AI not available)',
          fallback: true
        }
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Construct prompt for sentiment analysis
    const prompt = `Analyze the sentiment of the following text and provide a detailed analysis.

Text: "${text}"

${emotions.length > 0 ? `Detected emotions: ${emotions.join(', ')}` : ''}
${moodLevel ? `User's mood level: ${moodLevel}/7` : ''}

Please analyze the sentiment and respond with ONLY a JSON object in this exact format (no markdown, no code blocks):
{
  "score": <number between -1.0 and 1.0>,
  "confidence": <number between 0 and 1>,
  "analysis": "<brief analysis of the emotional state and sentiment>"
}

Guidelines:
- Score should be between -1.0 (very negative) and 1.0 (very positive)
- 0 represents neutral sentiment
- Consider the context, emotions mentioned, and overall tone
- Analysis should be 1-2 sentences summarizing the emotional state`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Clean the response - remove markdown code blocks if present
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
    }
    
    // Parse the AI response
    const sentimentData = JSON.parse(cleanedResponse);
    
    // Validate and clamp the score
    let score = parseFloat(sentimentData.score);
    if (isNaN(score) || score < -1) score = -1;
    if (score > 1) score = 1;
    
    // Round to 2 decimal places
    score = Math.round(score * 100) / 100;
    
    const sentimentResult: SentimentResult = {
      score,
      label: getSentimentLabel(score),
      confidence: sentimentData.confidence || 0.8,
      analysis: sentimentData.analysis || 'Sentiment analyzed successfully'
    };

    return NextResponse.json({
      success: true,
      data: sentimentResult
    });

  } catch (error) {
    console.error('Sentiment analysis error:', error);
    
    // Return fallback sentiment on error
    try {
      const body: AnalyzeTextRequest = await request.json();
      const fallbackScore = calculateFallbackSentiment(body.moodLevel, body.emotions);
      
      return NextResponse.json({
        success: true,
        data: {
          score: fallbackScore,
          label: getSentimentLabel(fallbackScore),
          confidence: 0.5,
          analysis: 'Fallback sentiment analysis',
          error: true
        }
      });
    } catch {
      return NextResponse.json({
        success: false,
        message: 'Failed to analyze sentiment'
      }, { status: 500 });
    }
  }
}

/**
 * Calculate fallback sentiment based on mood level and emotions
 */
function calculateFallbackSentiment(moodLevel?: number, emotions: string[] = []): number {
  let score = 0;
  
  // Base score from mood level (1-7 scale)
  if (moodLevel) {
    // Convert 1-7 to -1 to 1 scale
    // 1 -> -1, 4 -> 0, 7 -> 1
    score = (moodLevel - 4) / 3;
  }
  
  // Adjust based on emotions
  const negativeEmotions = ['sad', 'angry', 'anxious', 'stressed', 'frustrated', 'worried', 'lonely'];
  const positiveEmotions = ['happy', 'excited', 'grateful', 'loved', 'peaceful', 'confident', 'energetic'];
  
  let emotionAdjustment = 0;
  emotions.forEach(emotion => {
    const lowerEmotion = emotion.toLowerCase();
    if (negativeEmotions.some(neg => lowerEmotion.includes(neg))) {
      emotionAdjustment -= 0.1;
    }
    if (positiveEmotions.some(pos => lowerEmotion.includes(pos))) {
      emotionAdjustment += 0.1;
    }
  });
  
  score += emotionAdjustment;
  
  // Clamp between -1 and 1
  score = Math.max(-1, Math.min(1, score));
  
  return Math.round(score * 100) / 100;
}

/**
 * Get sentiment label from score
 */
function getSentimentLabel(score: number): string {
  if (score > 0.3) return 'positive';
  if (score < -0.3) return 'negative';
  return 'neutral';
}
