# Wellness Score System - Implementation Guide

## Overview

The Wellness Score System implements a sophisticated Multi-Criteria Decision Analysis (MCDA) algorithm to provide a comprehensive mental health assessment for students. It combines multiple data sources with scientifically validated weighting to produce a single, actionable wellness score (0-100).

## Algorithm Phases

### Phase 1: Normalization

All inputs are converted to a standard 0-1 scale where:
- **1.0** = Perfect Wellness
- **0.0** = Critical Distress

#### 1. Daily Mood (1-10 scale)
```
N_mood = (Input - 1) / 9
Example: Input 8 → 7/9 = 0.77
```

#### 2. PHQ-9 Depression Assessment (0-27 scale)
```
N_phq = 1 - (Input / 27)
Example: Input 15 (Moderately Severe) → 1 - 0.55 = 0.45
```

#### 3. GAD-7 Anxiety Assessment (0-21 scale)
```
N_gad = 1 - (Input / 21)
Example: Input 14 (Moderate) → 1 - 0.67 = 0.33
```

#### 4. AI Chatbot Sentiment (0-1 scale)
```
N_chat = Input
Note: Assumes 1 = Positive Sentiment
```

### Phase 2: Weighted Moving Average

Different data sources have different reliability:

| Component | Weight | Reasoning |
|-----------|--------|-----------|
| **Clinical (PHQ-9 + GAD-7)** | 50% (25% each) | Scientifically validated |
| **Daily Mood** | 30% | High frequency but subjective |
| **AI Chatbot** | 20% | Good for nuance but experimental |

#### Formula
```
WellnessScore = 100 × (0.30×N_mood + 0.25×N_phq + 0.25×N_gad + 0.20×N_chat)
```

Result: Score between 0 and 100

### Phase 3: Time Decay

Recent data is more relevant than old data.

#### For Daily Mood (Linear Weighted Moving Average)
```
CurrentMood = Σ(Score_i × i) / Σ(i)
```
Uses 14-day window where recent days get higher weight (Day 14 > Day 1)

#### For Chatbot Sentiment (Exponential Moving Average)
```
EMA_t = α × Value_t + (1-α) × EMA_(t-1)
```
Default α = 0.3 (30% weight to new values)

### Phase 4: Red Flag Override (Safety Protocol)

Critical thresholds prevent masking of severe issues:

| Threshold | Condition | Action |
|-----------|-----------|--------|
| **N_phq < 0.3** | Severe Depression (PHQ-9 > 18) | Cap score at 35 |
| **N_gad < 0.3** | Severe Anxiety (GAD-7 > 14) | Cap score at 35 |
| **N_chat < 0.2** | High Semantic Distress | Cap score at 35 |

#### Logic
```
If ANY critical threshold breached:
    FinalScore = min(CalculatedScore, 35)
```

This ensures students with critical issues are flagged as "At Risk" regardless of daily mood logs.

## Score Categories

| Score Range | Category | Color | Meaning |
|-------------|----------|-------|---------|
| 80-100 | Excellent | Green | Outstanding wellness |
| 60-79 | Good | Blue | Minor areas for improvement |
| 40-59 | Fair | Yellow | Moderate concerns |
| 20-39 | At Risk | Orange | Significant concerns |
| 0-19 | Critical | Red | Immediate intervention needed |

## Implementation

### Files Created

1. **`/src/lib/wellness-score.ts`**
   - Core algorithm implementation
   - All normalization functions
   - Weighted calculation
   - Time decay functions
   - Red flag logic

2. **`/src/app/api/wellness-score/route.ts`**
   - API endpoint: `GET /api/wellness-score?studentId={id}`
   - Fetches data from database
   - Calculates wellness score
   - Returns comprehensive result

3. **`/src/components/dashboard/WellnessScoreWidget.tsx`**
   - React component for displaying wellness score
   - Shows overall score with visual indicators
   - Breakdown by component
   - Red flag alerts
   - Educational information

## API Usage

### Request
```typescript
GET /api/wellness-score?studentId=e81c62e7-8804-4fb8-99fb-7a1b6697da5b
```

### Response
```json
{
  "success": true,
  "studentId": "e81c62e7-8804-4fb8-99fb-7a1b6697da5b",
  "wellnessScore": {
    "overallScore": 67.5,
    "normalizedScores": {
      "mood": 0.78,
      "phq9": 0.63,
      "gad7": 0.71,
      "chatbot": 0.65
    },
    "hasRedFlags": false,
    "redFlagReasons": [],
    "breakdown": {
      "moodContribution": 23.4,
      "phq9Contribution": 15.8,
      "gad7Contribution": 17.8,
      "chatbotContribution": 13.0
    }
  },
  "dataPoints": {
    "moodEntriesCount": 12,
    "hasPHQ9Data": true,
    "hasGAD7Data": false,
    "chatSessionsCount": 5
  },
  "lastUpdated": "2025-12-04T10:30:00.000Z"
}
```

## Component Usage

### Basic Usage
```tsx
import WellnessScoreWidget from '@/components/dashboard/WellnessScoreWidget';

<WellnessScoreWidget studentId="student-id-here" />
```

### With Breakdown Hidden
```tsx
<WellnessScoreWidget 
  studentId="student-id-here" 
  showBreakdown={false} 
/>
```

## Data Requirements

### Minimum Data
- At least 1 mood check-in (defaults to 5.5 if none)
- PHQ-9 score optional (defaults to 0.5 normalized if missing)
- GAD-7 score optional (defaults to 0.5 normalized if missing)
- Chatbot sentiment optional (defaults to 0.5 if none)

### Optimal Data
- 14+ mood check-ins over past 14 days
- Recent PHQ-9 assessment (within 30 days)
- Recent GAD-7 assessment (within 30 days)
- Multiple chat sessions for sentiment analysis

## Safety Features

### 1. Red Flag Detection
Automatically identifies critical wellness concerns:
- Severe depression (PHQ-9 score > 18)
- Severe anxiety (GAD-7 score > 14)
- High distress in conversations (sentiment < 0.2)

### 2. Score Capping
Prevents masking of serious issues:
- Maximum score of 35/100 when red flags present
- Always categorized as "At Risk" or worse

### 3. Alert System
Visual indicators for critical states:
- Red border on wellness card
- Prominent alert message
- List of specific concerns
- Recommendations for immediate action

## Integration with Existing Systems

### Mood Check-Ins
- Uses `moodCheckIns` table
- Filters last 30 days
- Applies 14-day weighted average

### PHQ-9 Assessments
- Uses `phq9_surveys` table
- Takes most recent survey
- Normalizes 0-27 scale to 0-1

### GAD-7 Assessments
- Ready for integration (placeholder implemented)
- Will use similar structure to PHQ-9

### Chatbot Sessions
- Uses `chatSessions` table
- Extracts `sentimentScore` field
- Applies exponential moving average

## Best Practices

### For Students
1. Check wellness score weekly
2. Understand component breakdown
3. Take action on red flags immediately
4. Complete regular assessments (PHQ-9, GAD-7)
5. Maintain consistent mood check-ins

### For Faculty/Counselors
1. Monitor students with scores < 40
2. Respond immediately to red flags
3. Use score trends over time
4. Don't rely solely on wellness score
5. Combine with personal interaction

### For Administrators
1. Track aggregate wellness trends
2. Identify at-risk student populations
3. Allocate resources based on data
4. Validate algorithm with clinical outcomes
5. Regular review of weight parameters

## Future Enhancements

### Planned Features
1. **GAD-7 Integration** - Add anxiety assessment support
2. **Historical Trends** - Show wellness score over time
3. **Predictive Analytics** - Forecast wellness trajectories
4. **Peer Comparison** - Anonymous benchmarking
5. **Personalized Recommendations** - AI-driven wellness tips

### Algorithm Improvements
1. **Adaptive Weights** - Adjust weights based on data availability
2. **Context Awareness** - Account for exam periods, holidays
3. **Confidence Intervals** - Show certainty of score
4. **Multi-dimensional Analysis** - Separate physical/mental/social
5. **Intervention Tracking** - Measure impact of counseling

## Testing

### Unit Tests
Test individual functions:
```typescript
import { normalizeMood, normalizePHQ9, normalizeGAD7 } from '@/lib/wellness-score';

// Test normalization
expect(normalizeMood(8)).toBe(7/9);
expect(normalizePHQ9(15)).toBe(1 - 15/27);
```

### Integration Tests
Test API endpoint:
```typescript
const response = await fetch('/api/wellness-score?studentId=test-id');
expect(response.status).toBe(200);
const data = await response.json();
expect(data.wellnessScore.overallScore).toBeGreaterThanOrEqual(0);
expect(data.wellnessScore.overallScore).toBeLessThanOrEqual(100);
```

## Troubleshooting

### Common Issues

**Issue**: Wellness score always returns 50
- **Cause**: No data in database
- **Solution**: Ensure student has mood check-ins and assessments

**Issue**: Red flags not triggering
- **Cause**: Threshold misconfiguration
- **Solution**: Check `CRITICAL_THRESHOLDS` in wellness-score.ts

**Issue**: Score seems incorrect
- **Cause**: Data normalization issue
- **Solution**: Verify input ranges (mood 1-10, PHQ-9 0-27, GAD-7 0-21)

## License & Credits

This wellness score algorithm is based on Multi-Criteria Decision Analysis (MCDA) principles commonly used in medical decision-making. The specific implementation was designed for academic mental health contexts.

**References**:
- PHQ-9: Kroenke, K., Spitzer, R. L., & Williams, J. B. (2001)
- GAD-7: Spitzer, R. L., Kroenke, K., Williams, J. B., & Löwe, B. (2006)
- MCDA: Belton, V., & Stewart, T. (2002)

---

**Version**: 1.0.0  
**Last Updated**: December 4, 2025  
**Maintained By**: SoulWise Connect Development Team
