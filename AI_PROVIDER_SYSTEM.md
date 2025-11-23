# AI Provider System Documentation

## Overview

The chatbot now supports **multiple AI providers** through a flexible interface system. You can easily switch between different AI models without changing your application code.

## Supported Providers

| Provider | Status | Features | Languages |
|----------|--------|----------|-----------|
| **Gemini** | ✅ Active | Fast, reliable, good reasoning | English, Hindi |
| **Sarvam AI** | ✅ Ready | Indian-focused, multilingual | Hindi, English, 10+ Indian languages |
| OpenAI | 🔜 Coming | GPT-4, GPT-3.5 | English (worldwide) |
| Claude | 🔜 Coming | Anthropic's Claude | English (worldwide) |

## Quick Start

### 1. Choose Your AI Provider

Edit your `.env.local` file:

```bash
# Current: Using Gemini
NEXT_PUBLIC_AI_PROVIDER="gemini"
NEXT_PUBLIC_GEMINI_API_KEY="AIzaSy..."

# Switch to Sarvam AI
NEXT_PUBLIC_AI_PROVIDER="sarvam"
NEXT_PUBLIC_SARVAM_API_KEY="your-sarvam-key"
```

### 2. Get API Keys

#### Gemini (Google)
1. Go to: https://makersuite.google.com/app/apikey
2. Create API key
3. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_GEMINI_API_KEY="your-key-here"
   ```

#### Sarvam AI (Indian AI)
1. Go to: https://www.sarvam.ai/
2. Sign up for API access
3. Get your API key
4. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_SARVAM_API_KEY="your-key-here"
   ```

## Architecture

### File Structure

```
src/lib/ai/
├── types.ts                    # TypeScript interfaces
├── provider-factory.ts         # Provider management
├── sentiment-analyzer.ts       # Sentiment & emotion detection
└── providers/
    ├── gemini.ts              # Google Gemini implementation
    ├── sarvam.ts              # Sarvam AI implementation
    ├── openai.ts              # (Coming soon)
    └── claude.ts              # (Coming soon)

src/app/api/
├── chatbot/route.ts           # Legacy API (Gemini only)
└── chatbot-v2/route.ts        # New API (multi-provider)
```

### Provider Interface

All providers implement the same interface:

```typescript
interface IAIProvider {
  name: AIProvider;
  generateResponse(request: AIRequest): Promise<AIResponse>;
  analyzeSentiment(message: string): Promise<{...}>;
  detectEmotions(message: string): Promise<EmotionScores>;
  assessRisk(message: string, emotions: EmotionScores): Promise<RiskLevel>;
  isAvailable(): boolean;
}
```

## Usage Examples

### Example 1: Using Default Provider

```typescript
// In your component or API route
import { getAIProvider } from '@/lib/ai/provider-factory';

const provider = getAIProvider(); // Uses NEXT_PUBLIC_AI_PROVIDER
const response = await provider.generateResponse({
  messages: [
    { role: 'user', content: 'I feel anxious about exams' }
  ]
});

console.log(response.message);
console.log('Sentiment:', response.sentiment.label);
console.log('Risk Level:', response.riskLevel);
```

### Example 2: Switching Providers Dynamically

```typescript
// Use Gemini for English
const gemini = getAIProvider('gemini');
const englishResponse = await gemini.generateResponse({
  messages: [{ role: 'user', content: 'I need help' }]
});

// Use Sarvam for Hindi
const sarvam = getAIProvider('sarvam');
const hindiResponse = await sarvam.generateResponse({
  messages: [{ role: 'user', content: 'मुझे मदद चाहिए' }]
});
```

### Example 3: Frontend Integration

```typescript
// In ChatBot.tsx
const sendMessage = async () => {
  const response = await fetch('/api/chatbot-v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: userMessage,
      sessionId: currentSessionId,
      provider: 'sarvam', // Optional: override default provider
      conversationHistory: messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content
      }))
    })
  });

  const data = await response.json();
  console.log('Provider used:', data.provider);
  console.log('Response:', data.message);
};
```

## Sarvam AI Integration

### Why Sarvam AI?

1. **Indian-focused**: Built for Indian languages and cultural context
2. **Multilingual**: Supports Hindi, Tamil, Telugu, Marathi, and 10+ Indian languages
3. **Cost-effective**: Competitive pricing for Indian market
4. **Low latency**: Servers in India for faster response times

### Sarvam Configuration

```bash
# .env.local
NEXT_PUBLIC_SARVAM_API_KEY="your-key"
NEXT_PUBLIC_SARVAM_MODEL="sarvam-2b"  # or "sarvam-1"
NEXT_PUBLIC_SARVAM_ENDPOINT="https://api.sarvam.ai/v1/chat/completions"
```

### Sarvam Features

```typescript
const sarvam = getAIProvider('sarvam');

// Responds in Hindi automatically
const response = await sarvam.generateResponse({
  messages: [
    { role: 'user', content: 'मुझे बहुत टेंशन है' }
  ]
});

// Response will be in Hindi:
// "मैं समझ सकता हूं कि आप तनाव में हैं..."
```

## Migration Guide

### From Old API to New API

**Before (Gemini only):**
```typescript
// ChatBot.tsx
const response = await fetch('/api/chatbot', {
  method: 'POST',
  body: JSON.stringify({ message, sessionId })
});
```

**After (Multi-provider):**
```typescript
// ChatBot.tsx
const response = await fetch('/api/chatbot-v2', {
  method: 'POST',
  body: JSON.stringify({ 
    message, 
    sessionId,
    provider: 'sarvam', // Optional
    conversationHistory: messages
  })
});
```

### Updating ChatBot Component

1. **Change API endpoint:**
   ```diff
   - const response = await fetch('/api/chatbot', {
   + const response = await fetch('/api/chatbot-v2', {
   ```

2. **Add provider selection (optional):**
   ```typescript
   const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemini');
   
   // In your fetch call:
   body: JSON.stringify({ 
     message, 
     sessionId,
     provider: selectedProvider // User can switch providers
   })
   ```

3. **Handle new response format:**
   ```typescript
   const data = await response.json();
   console.log('Provider:', data.provider);
   console.log('Sentiment:', data.sentiment);
   console.log('Emotions:', data.emotions);
   console.log('Risk:', data.riskLevel);
   ```

## Adding New Providers

### Step 1: Create Provider Class

Create `src/lib/ai/providers/openai.ts`:

```typescript
import { IAIProvider, AIRequest, AIResponse } from '../types';

export class OpenAIProvider implements IAIProvider {
  name = 'openai' as const;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    // Implement OpenAI API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: request.messages,
      }),
    });

    // Process response and return AIResponse
    // ... implement sentiment analysis, emotion detection, etc.
  }

  // Implement other required methods...
}
```

### Step 2: Register in Factory

Edit `src/lib/ai/provider-factory.ts`:

```typescript
import { OpenAIProvider } from './providers/openai';

export function getAIProvider(provider?: AIProvider): IAIProvider {
  switch (provider) {
    case 'openai':
      return createOpenAIProvider();
    // ... other cases
  }
}

function createOpenAIProvider(): OpenAIProvider {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
  if (!apiKey) throw new Error('OpenAI API key not configured');
  return new OpenAIProvider(apiKey);
}
```

### Step 3: Add Environment Variables

```bash
# .env.local
NEXT_PUBLIC_OPENAI_API_KEY="sk-..."
NEXT_PUBLIC_OPENAI_MODEL="gpt-4"
```

### Step 4: Use It!

```typescript
const provider = getAIProvider('openai');
const response = await provider.generateResponse({ messages });
```

## Testing

### Test Provider Availability

```typescript
import { getAvailableProviders } from '@/lib/ai/provider-factory';

const available = getAvailableProviders();
console.log('Available providers:', available);
// Output: ['gemini', 'sarvam']
```

### Test Sentiment Analysis

```typescript
import { analyzeSentiment } from '@/lib/ai/sentiment-analyzer';

const result = analyzeSentiment('I feel anxious and worried');
console.log(result);
// Output: { label: 'negative', score: 0.85 }
```

### Test Emotion Detection

```typescript
import { detectEmotions } from '@/lib/ai/sentiment-analyzer';

const emotions = detectEmotions('I am scared and nervous');
console.log(emotions);
// Output: { fear: 0.67, anger: 0, sadness: 0, ... }
```

## Best Practices

### 1. Provider Failover

```typescript
async function getResponseWithFailover(message: string) {
  const providers: AIProvider[] = ['sarvam', 'gemini'];
  
  for (const providerName of providers) {
    try {
      const provider = getAIProvider(providerName);
      return await provider.generateResponse({ messages: [{ role: 'user', content: message }] });
    } catch (error) {
      console.warn(`Provider ${providerName} failed, trying next...`);
    }
  }
  
  throw new Error('All providers failed');
}
```

### 2. Language Detection

```typescript
function detectLanguage(message: string): 'en' | 'hi' {
  const hindiRegex = /[\u0900-\u097F]/;
  return hindiRegex.test(message) ? 'hi' : 'en';
}

const language = detectLanguage(message);
const provider = language === 'hi' ? 'sarvam' : 'gemini';
```

### 3. Cost Optimization

```typescript
// Use cheaper model for simple queries
function selectProvider(message: string): AIProvider {
  const wordCount = message.split(' ').length;
  
  if (wordCount < 20) {
    return 'sarvam'; // Cheaper for short messages
  } else {
    return 'gemini'; // Better for complex conversations
  }
}
```

## Environment Variables Reference

```bash
# AI Provider Selection
NEXT_PUBLIC_AI_PROVIDER="gemini"  # gemini | sarvam | openai | claude

# Gemini (Google)
NEXT_PUBLIC_GEMINI_API_KEY="AIzaSy..."
NEXT_PUBLIC_GEMINI_MODEL="gemini-2.0-flash-exp"

# Sarvam AI (Indian AI)
NEXT_PUBLIC_SARVAM_API_KEY="sarvam_..."
NEXT_PUBLIC_SARVAM_MODEL="sarvam-2b"
NEXT_PUBLIC_SARVAM_ENDPOINT="https://api.sarvam.ai/v1/chat/completions"

# OpenAI (Future)
NEXT_PUBLIC_OPENAI_API_KEY="sk-..."
NEXT_PUBLIC_OPENAI_MODEL="gpt-4"

# Claude (Future)
NEXT_PUBLIC_CLAUDE_API_KEY="sk-ant-..."
NEXT_PUBLIC_CLAUDE_MODEL="claude-3-opus"
```

## Troubleshooting

### Provider Not Available

```typescript
import { getAvailableProviders } from '@/lib/ai/provider-factory';

const available = getAvailableProviders();
if (!available.includes('sarvam')) {
  console.error('Sarvam not available. Check API key.');
}
```

### API Key Issues

```bash
# Check if API key is set
echo $NEXT_PUBLIC_SARVAM_API_KEY

# Test with curl
curl -X POST https://api.sarvam.ai/v1/chat/completions \
  -H "Authorization: Bearer $NEXT_PUBLIC_SARVAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"sarvam-2b","messages":[{"role":"user","content":"Hello"}]}'
```

### Error Handling

```typescript
try {
  const provider = getAIProvider('sarvam');
  const response = await provider.generateResponse(request);
} catch (error) {
  if (error.message.includes('API key')) {
    // Handle authentication error
    console.error('Check your Sarvam API key');
  } else if (error.message.includes('rate limit')) {
    // Handle rate limit
    console.error('Rate limit exceeded, try again later');
  } else {
    // Generic error
    console.error('AI provider error:', error);
  }
}
```

## Cost Comparison

| Provider | Input (per 1M tokens) | Output (per 1M tokens) | Best For |
|----------|---------------------|----------------------|----------|
| Gemini Flash | $0.075 | $0.30 | General use, English |
| Sarvam AI | $0.05 | $0.15 | Hindi, Indian languages |
| GPT-3.5 Turbo | $0.50 | $1.50 | Complex reasoning |
| GPT-4 | $30 | $60 | Advanced tasks |

## Next Steps

1. ✅ **Test current providers** (Gemini, Sarvam)
2. 🔄 **Migrate ChatBot.tsx** to use `/api/chatbot-v2`
3. 🎨 **Add provider selector UI** in chatbot settings
4. 📊 **Add analytics** to track provider performance
5. 🌐 **Add OpenAI** and **Claude** providers
6. 🧪 **A/B test** different providers for best results

## Support

- **Gemini Docs**: https://ai.google.dev/docs
- **Sarvam AI Docs**: https://docs.sarvam.ai/
- **Issues**: Create an issue in your repo

---

**Last Updated**: November 23, 2025
**Version**: 1.0.0
