# GAD-7 Assessment Implementation

## Overview
The GAD-7 (Generalized Anxiety Disorder 7-item scale) has been successfully implemented following the same pattern as PHQ-9. Students can now take anxiety assessments to monitor their mental health.

## Features Implemented

### 1. Database Schema
- **Model**: `GAD7Survey` with 7 questions (q1-q7)
- **Scoring**: Total score from 0-21
- **Severity Levels**:
  - MINIMAL (0-4): Minimal anxiety
  - MILD (5-9): Mild anxiety
  - MODERATE (10-14): Moderate anxiety
  - SEVERE (15-21): Severe anxiety

### 2. Assessment Questions
The GAD-7 assesses anxiety symptoms over the past 2 weeks:
1. Feeling nervous, anxious, or on edge
2. Not being able to stop or control worrying
3. Worrying too much about different things
4. Trouble relaxing
5. Being so restless that it's hard to sit still
6. Becoming easily annoyed or irritable
7. Feeling afraid as if something awful might happen

Each question scored 0-3:
- 0: Not at all
- 1: Several days
- 2: More than half the days
- 3: Nearly every day

### 3. Files Created

#### API Route
- `/src/app/api/gad7-survey/route.ts`
  - POST: Submit new GAD-7 assessment
  - GET: Retrieve assessment history

#### Components
- `/src/components/dashboard/GAD7SurveyForm.tsx`
  - Interactive form with all 7 questions
  - Real-time validation
  - Results display with severity information
  - Support resource recommendations

#### Page
- `/src/app/gad7-survey/page.tsx`
  - Assessment landing page
  - History tracking (total assessments, latest score)
  - Score interpretation guide
  - List of all completed assessments

### 4. Integration Points

#### Wellness Score System
- Updated `/src/app/api/wellness-score/route.ts` to fetch actual GAD-7 data
- GAD-7 contributes 25% to overall wellness score
- Red flag threshold: Score ≥ 15 (normalized < 0.3)

#### Dashboard
- Added GAD-7 quick action card in student dashboard
- Accessible via "GAD-7 Assessment" button
- Color scheme: Green to Blue gradient

## Usage

### Taking an Assessment
1. Navigate to `/gad7-survey` or click "GAD-7 Assessment" on dashboard
2. Answer all 7 questions about the past 2 weeks
3. Submit to receive immediate results
4. View severity level and recommended actions

### Viewing History
- Assessment history displayed on GAD-7 page
- Shows total count and most recent score
- Full list of all completed assessments with dates

### API Endpoints

#### Submit Assessment
```typescript
POST /api/gad7-survey
Body: {
  studentId: string,
  q1_nervous: number,    // 0-3
  q2_control: number,    // 0-3
  q3_worrying: number,   // 0-3
  q4_relaxing: number,   // 0-3
  q5_restless: number,   // 0-3
  q6_irritable: number,  // 0-3
  q7_afraid: number      // 0-3
}
```

#### Get Assessment History
```typescript
GET /api/gad7-survey?studentId={id}
Response: {
  success: boolean,
  surveys: Array<GAD7Survey>,
  completedSurveys: number,
  latestSurvey: GAD7Survey | null
}
```

## Database Schema

```prisma
model GAD7Survey {
  id              String       @id @default(uuid())
  completedAt     DateTime     @default(now()) @map("completed_at")
  q1Nervous       Int          @map("q1_nervous")
  q2Control       Int          @map("q2_control")
  q3Worrying      Int          @map("q3_worrying")
  q4Relaxing      Int          @map("q4_relaxing")
  q5Restless      Int          @map("q5_restless")
  q6Irritable     Int          @map("q6_irritable")
  q7Afraid        Int          @map("q7_afraid")
  totalScore      Int          @map("total_score")
  severity        GAD7Severity
  studentId       String       @map("student_id")
  student         Student      @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@index([studentId, completedAt])
  @@map("gad7_surveys")
}

enum GAD7Severity {
  MINIMAL
  MILD
  MODERATE
  SEVERE
}
```

## Clinical Interpretation

### Score Ranges
- **0-4 (Minimal)**: Little to no anxiety symptoms
- **5-9 (Mild)**: Mild anxiety, monitor and self-care strategies
- **10-14 (Moderate)**: Moderate anxiety, counseling recommended
- **15-21 (Severe)**: Severe anxiety, professional support strongly recommended

### Red Flags
Scores of 15 or higher trigger:
- Immediate alert display
- Recommendation to contact counseling services
- Crisis helpline information
- Faculty mentor notification option

## Integration with Wellness Score

The GAD-7 assessment is integrated into the comprehensive wellness score calculation:

1. **Normalization**: Score converted to 0-1 scale (higher = better)
   - Formula: `N_gad = 1 - (score / 21)`

2. **Weighting**: Contributes 25% to overall wellness score

3. **Red Flag Override**: Score ≥ 15 caps wellness score at 35/100

4. **Update Trigger**: New GAD-7 assessment automatically updates wellness score

## Best Practices

1. **Regular Screening**: Recommend students complete GAD-7 every 2-4 weeks
2. **Combined Assessment**: Use alongside PHQ-9 for comprehensive mental health screening
3. **Follow-up**: Moderate/Severe scores should trigger counselor notification
4. **Privacy**: All responses are confidential and encrypted
5. **Support**: Always provide immediate resources after assessment completion

## Next Steps

Consider implementing:
- Trend analysis and graphing over time
- Automated counselor alerts for severe scores
- Integration with appointment booking for high scores
- Email notifications for follow-up assessments
- Comparison charts between GAD-7 and PHQ-9 scores
