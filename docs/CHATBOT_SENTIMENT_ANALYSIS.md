# Chatbot Sentiment Analysis Integration

## 📋 Overview

The chatbot now automatically performs **sentiment analysis** on every user message and stores the results in **DynamoDB** for mental health tracking and insights.

## 🔄 Integration Flow

```
User sends message
    ↓
1. SENTIMENT ANALYSIS (Real-time)
   - Analyze sentiment (positive/neutral/negative)
   - Detect emotions (fear, anger, sadness, joy, disgust, trust, surprise)
   - Assess risk level (normal/mild/severe)
    ↓
2. SAVE TO DYNAMODB
   - Store user message with sentiment data
   - Track timestamp, session ID, user ID
    ↓
3. CRISIS DETECTION
   - Check for crisis keywords
   - Send SMS alerts if critical/high
    ↓
4. GENERATE AI RESPONSE
   - Call Gemini API
   - Get supportive response
    ↓
5. SAVE BOT RESPONSE
   - Store bot message to DynamoDB
   - Mark as "assistant" role
    ↓
6. RETURN RESPONSE
   - Send message + sentiment data to frontend
```

## 📊 Data Stored in DynamoDB

### User Message Entry
```typescript
{
  user_id: "user-123",
  timestamp: "20250124-143022-456abc",
  role: "user",
  message: "I'm feeling really anxious about my exams",
  
  // Sentiment Analysis Results
  sentiment_label: "negative",
  sentiment_score: 0.72,
  emotions: {
    fear: 0.8,
    anger: 0.0,
    sadness: 0.3,
    joy: 0.0,
    disgust: 0.0,
    trust: 0.1,
    surprise: 0.2
  },
  risk_level: "mild",
  
  created_at: "2025-01-24T14:30:22.456Z"
}
```

### Bot Response Entry
```typescript
{
  user_id: "user-123",
  timestamp: "20250124-143025-789def",
  role: "assistant",
  message: "I understand you're feeling anxious...",
  
  sentiment_label: "positive",
  sentiment_score: 0.7,
  emotions: {
    fear: 0.0,
    anger: 0.0,
    sadness: 0.0,
    joy: 0.5,
    disgust: 0.0,
    trust: 0.8,
    surprise: 0.0
  },
  risk_level: "normal",
  
  created_at: "2025-01-24T14:30:25.789Z"
}
```

## 🎯 Sentiment Analysis Details

### Sentiment Labels
- **Positive**: Optimistic, happy, grateful content
- **Neutral**: Factual, informational content
- **Negative**: Sad, anxious, stressed content

### Sentiment Score
- Range: 0.0 - 1.0
- Higher = More intense sentiment
- Used for tracking mood trends over time

### Emotion Detection
7 core emotions tracked (0.0 - 1.0 scale):
- 😨 **Fear**: Anxiety, worry, nervousness
- 😠 **Anger**: Frustration, irritation, rage
- 😢 **Sadness**: Depression, grief, unhappiness
- 😊 **Joy**: Happiness, excitement, delight
- 🤢 **Disgust**: Revulsion, dislike
- 🤝 **Trust**: Confidence, security, faith
- 😲 **Surprise**: Shock, amazement, unexpectedness

### Risk Levels
- **Normal**: No concerning indicators
- **Mild**: Some stress/negative emotions
- **Severe**: Crisis keywords detected (suicide, self-harm)

## 🛠️ API Endpoints

### 1. POST /api/chatbot
**Send a message and get AI response with sentiment analysis**

```typescript
// Request
POST /api/chatbot
{
  "message": "I'm feeling really stressed",
  "sessionId": "session-123",
  "userId": "user-456"
}

// Response
{
  "success": true,
  "message": "I understand you're feeling stressed...",
  "timestamp": "2025-01-24T14:30:25.789Z",
  "crisisLevel": "none",
  "smsAlertSent": false,
  "sentiment": {
    "label": "negative",
    "score": 0.68,
    "emotions": {
      "fear": 0.5,
      "anger": 0.2,
      "sadness": 0.4,
      "joy": 0.0,
      "disgust": 0.0,
      "trust": 0.1,
      "surprise": 0.0
    },
    "riskLevel": "mild"
  }
}
```

### 2. GET /api/sentiment-analysis
**Retrieve sentiment analysis history**

#### Get Chat History with Sentiment
```bash
GET /api/sentiment-analysis?userId=user-123&type=history&limit=50

# Response
{
  "success": true,
  "data": {
    "userId": "user-123",
    "messageCount": 42,
    "messages": [
      {
        "id": "20250124-143022-456abc",
        "role": "user",
        "message": "I'm anxious",
        "sentiment": {
          "label": "negative",
          "score": 0.72
        },
        "emotions": { ... },
        "riskLevel": "mild",
        "timestamp": "2025-01-24T14:30:22.456Z"
      }
    ]
  }
}
```

#### Get Sentiment Trend
```bash
GET /api/sentiment-analysis?userId=user-123&type=trend&days=7

# Response
{
  "success": true,
  "data": {
    "userId": "user-123",
    "days": 7,
    "trend": [
      {
        "date": "2025-01-20",
        "positive": 5,
        "neutral": 3,
        "negative": 8,
        "riskEvents": 2,
        "total": 16
      }
    ]
  }
}
```

#### Get Conversation Context
```bash
GET /api/sentiment-analysis?userId=user-123&type=context&limit=10

# Response
{
  "success": true,
  "data": {
    "userId": "user-123",
    "messageCount": 10,
    "overallSentiment": "negative",
    "riskLevel": "mild",
    "emotionSummary": {
      "fear": 0.45,
      "anger": 0.12,
      "sadness": 0.38,
      "joy": 0.08,
      "disgust": 0.02,
      "trust": 0.15,
      "surprise": 0.05
    },
    "recentMessages": [ ... ]
  }
}
```

### 3. POST /api/sentiment-analysis
**Analyze text without saving (utility endpoint)**

```typescript
POST /api/sentiment-analysis
{
  "text": "I'm feeling really anxious about my exams"
}

// Response
{
  "success": true,
  "data": {
    "text": "I'm feeling really anxious about my exams",
    "sentiment": {
      "label": "negative",
      "score": 0.72
    },
    "emotions": {
      "fear": 0.8,
      "anger": 0.0,
      "sadness": 0.3,
      "joy": 0.0,
      "disgust": 0.0,
      "trust": 0.1,
      "surprise": 0.2
    },
    "riskLevel": "mild",
    "timestamp": "2025-01-24T14:30:22.456Z"
  }
}
```

## 📈 Use Cases

### 1. **Student Wellness Dashboard**
Track mental health trends over time:
```typescript
// Get 30-day sentiment trend
const response = await fetch('/api/sentiment-analysis?userId=user-123&type=trend&days=30');
const { data } = await response.json();

// Visualize on chart
data.trend.forEach(day => {
  console.log(`${day.date}: ${day.positive} positive, ${day.negative} negative`);
});
```

### 2. **Faculty Dashboard - Student Monitoring**
View student's recent mental health status:
```typescript
const response = await fetch('/api/sentiment-analysis?userId=student-456&type=context');
const { data } = await response.json();

if (data.riskLevel === 'severe') {
  // Alert counselor
  console.log('⚠️ Student needs immediate attention');
}
```

### 3. **Mood Tracker Integration**
Combine chatbot sentiment with daily mood entries:
```typescript
// Get chat sentiment for today
const chatSentiment = await fetch('/api/sentiment-analysis?userId=user-123&type=recent&limit=10');

// Compare with mood tracker entry
const moodEntry = await fetch('/api/mood-tracker?userId=user-123&date=today');

// Calculate overall wellness score
const wellnessScore = (chatSentiment + moodEntry) / 2;
```

### 4. **Crisis Detection Timeline**
View history of crisis events:
```typescript
const response = await fetch('/api/sentiment-analysis?userId=user-123&type=history&limit=100');
const { data } = await response.json();

const crisisEvents = data.messages.filter(msg => msg.riskLevel === 'severe');
console.log(`Found ${crisisEvents.length} crisis events`);
```

## 🔧 Configuration

### Environment Variables
```env
# DynamoDB Configuration
NEXT_PUBLIC_DYNAMODB_TABLE=ChatMemory
NEXT_PUBLIC_AWS_REGION=ap-south-1
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your_access_key
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your_secret_key

# Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

### DynamoDB Table Schema
```sql
Table Name: ChatMemory

Primary Key:
- HASH: user_id (String)
- RANGE: timestamp (String)

Attributes:
- role (String): "user" | "assistant"
- message (String)
- sentiment_label (String): "positive" | "neutral" | "negative"
- sentiment_score (Number): 0.0 - 1.0
- emotions (Map):
  - fear (Number)
  - anger (Number)
  - sadness (Number)
  - joy (Number)
  - disgust (Number)
  - trust (Number)
  - surprise (Number)
- risk_level (String): "normal" | "mild" | "severe"
- created_at (String): ISO timestamp
```

## 📊 Frontend Integration

### Display Sentiment in Chat UI
```tsx
// In ChatBot.tsx
const [sentimentData, setSentimentData] = useState(null);

const sendMessage = async (message: string) => {
  const response = await fetch('/api/chatbot', {
    method: 'POST',
    body: JSON.stringify({ 
      message, 
      sessionId, 
      userId 
    })
  });
  
  const data = await response.json();
  
  if (data.sentiment) {
    setSentimentData(data.sentiment);
    console.log('User sentiment:', data.sentiment.label);
    console.log('Risk level:', data.sentiment.riskLevel);
  }
};
```

### Sentiment Badge Component
```tsx
function SentimentBadge({ sentiment }: { sentiment: any }) {
  const colors = {
    positive: 'bg-green-100 text-green-800',
    neutral: 'bg-gray-100 text-gray-800',
    negative: 'bg-red-100 text-red-800',
  };
  
  return (
    <span className={`px-2 py-1 rounded text-xs ${colors[sentiment.label]}`}>
      {sentiment.label} ({(sentiment.score * 100).toFixed(0)}%)
    </span>
  );
}
```

## 🧪 Testing

### Test Sentiment Analysis
```bash
# Test with anxious message
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am feeling very anxious and scared about my exams",
    "userId": "test-user",
    "sessionId": "test-session"
  }'

# Expected: sentiment.label = "negative", emotions.fear = high
```

### Test Crisis Detection
```bash
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want to hurt myself",
    "userId": "test-user",
    "sessionId": "test-session"
  }'

# Expected: riskLevel = "severe", crisisLevel = "critical", SMS alert sent
```

### Test Sentiment History
```bash
# Get history
curl "http://localhost:3000/api/sentiment-analysis?userId=test-user&type=history&limit=10"

# Get trend
curl "http://localhost:3000/api/sentiment-analysis?userId=test-user&type=trend&days=7"
```

## 🚀 Advanced Features

### 1. Real-time Wellness Alerts
```typescript
// Monitor sentiment and trigger alerts
if (sentiment.riskLevel === 'severe') {
  await sendAlertToCounselor(userId);
}

if (sentiment.score < 0.3 && emotions.sadness > 0.7) {
  await suggestProfessionalHelp(userId);
}
```

### 2. Personalized Responses
```typescript
// Adjust bot tone based on user sentiment
const context = await getConversationContext(userId);

if (context.overallSentiment === 'negative') {
  // Use more empathetic, supportive tone
  prompt = buildEmpatheticPrompt(message);
} else {
  // Use encouraging, motivational tone
  prompt = buildMotivationalPrompt(message);
}
```

### 3. Sentiment Trend Visualization
```typescript
// Use Chart.js or Recharts
const trend = await getSentimentTrend(userId, 30);

<LineChart data={trend}>
  <Line dataKey="positive" stroke="#10b981" />
  <Line dataKey="negative" stroke="#ef4444" />
  <Line dataKey="neutral" stroke="#6b7280" />
</LineChart>
```

## 📝 Summary

### ✅ Implemented
- Real-time sentiment analysis on every message
- Emotion detection (7 emotions)
- Risk level assessment
- DynamoDB storage with full history
- Sentiment trend tracking
- API endpoints for data retrieval
- Frontend integration with userId tracking

### 🎯 Benefits
- **Mental Health Tracking**: Monitor student wellness over time
- **Early Intervention**: Detect declining mental health patterns
- **Crisis Prevention**: Identify severe risk cases immediately
- **Data-Driven Insights**: Inform counseling strategies
- **Privacy-First**: Sentiment analysis happens server-side

### 🔄 Next Steps
1. **AI Enhancement**: Replace keyword-based analysis with ML models (AWS Comprehend, Hugging Face)
2. **Dashboard UI**: Build admin dashboard to visualize sentiment trends
3. **Automated Reports**: Generate weekly wellness reports for counselors
4. **Predictive Analytics**: Use historical data to predict mental health declines
5. **Integration**: Connect with mood tracker and community sentiment

---

**Last Updated**: 24 November 2025  
**Status**: ✅ Production Ready  
**Database**: DynamoDB (ChatMemory table)
