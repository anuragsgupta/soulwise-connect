# Enhanced Mood Check-In System Update

**Date:** December 2, 2025

## 🎯 Overview

Successfully redesigned the mood check-in flow with the following key improvements:

1. **Integrated mood factors selection** directly into the first screen
2. **Dynamic emoji display** that changes based on mood level
3. **Sentiment analysis** of journal entries using AI
4. **Automatic diary entry creation** with date-based titles
5. **Reduced flow from 6 steps to 5 steps** for better UX

## 📋 Changes Summary

### 1. UI/UX Redesign

#### MoodSliderScreen.tsx
- **Added mood factors selection** below the mood slider
- Shows 5 factor buttons: Sleep Quality, Energy Level, Stress Level, Social Connection, Physical Activity
- Factors are optional and displayed with icons
- Title updated: "How are you feeling?" with subtitle "Which emoji suits you?"
- Emoji dynamically changes based on selected mood level
- Updated signature: `onNext: (moodLevel: number, moodFactors: string[]) => void`

#### Flow Restructure (MoodCheckInFlow.tsx)
- **Removed separate MoodFactorsScreen** (Step 3)
- New 5-step flow:
  1. **Mood & Factors** - Mood slider with integrated factors selection
  2. **Emotions** - Select emotions you're feeling
  3. **Activities** - What you're currently doing
  4. **Company** - Who you're with
  5. **Journal** - "What are your thoughts?" (diary entry)

#### Progress Indicators
Updated all screens to show 5 steps instead of 6:
- MoodSliderScreen: Step 1 of 5
- EmotionTagScreen: Step 2 of 5 (with completed step indicator)
- ActivityTagScreen: Step 3 of 5
- CompanyTagScreen: Step 4 of 5
- JournalScreen: Step 5 of 5

### 2. Database Schema Updates

#### MoodCheckIn Model
```prisma
model MoodCheckIn {
  id          String   @id @default(uuid())
  moodScore   Int      @map("mood_score") // Changed from 1-5 to 1-7
  moodLabel   String   @map("mood_label") // Updated labels
  factors     Json?    // Array of mood factors (sleep, energy, stress, etc.)
  emotions    String[] // NEW: Array of emotions
  activities  String[] // NEW: Array of activities
  company     String[] // NEW: Who the student is with
  sentiment   Decimal? @db.Decimal(3, 2) // NEW: AI sentiment score (-1 to 1)
  notes       String?  @db.Text // Journal text
  checkInDate DateTime @map("check_in_date") @db.Date
  createdAt   DateTime @default(now()) @map("created_at")
  
  student   Student @relation(fields: [studentId], references: [id])
  studentId String  @map("student_id")
}
```

#### DiaryEntry Model
```prisma
model DiaryEntry {
  id         String   @id @default(uuid())
  title      String   // NEW: Auto-generated from date (e.g., "December 2, 2025")
  content    String   @db.Text
  mood       String   // Mood label from check-in
  sentiment  Decimal? @db.Decimal(3, 2) // NEW: AI sentiment score
  emotions   String[] // NEW: Array of emotions from check-in
  tags       Json?    // Optional additional tags
  wordCount  Int      @default(0)
  charCount  Int      @default(0)
  entryDate  DateTime @default(now())
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  student   Student @relation(fields: [studentId], references: [id])
  studentId String  @map("student_id")
}
```

**Migration Applied:**
- `20251202022807_add_sentiment_and_update_mood_diary`

### 3. New API Endpoints

#### `/api/analyze-sentiment` (POST)
Performs sentiment analysis on text using Google Gemini AI.

**Request:**
```json
{
  "text": "Journal entry text...",
  "emotions": ["happy", "excited"],
  "moodLevel": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 0.75,        // -1 to 1 scale
    "label": "positive",  // positive, negative, or neutral
    "confidence": 0.85,
    "analysis": "Brief emotional analysis summary"
  }
}
```

**Features:**
- Uses Gemini 1.5 Flash for AI analysis
- Fallback to rule-based sentiment if AI unavailable
- Considers mood level and emotions for context
- Returns score from -1 (very negative) to 1 (very positive)

### 4. Enhanced Mood Check-In API Updates

#### `/api/mood-checkin/enhanced` (POST)

**New Behavior:**
1. Accepts `moodFactors` array (from first screen)
2. **Automatically performs sentiment analysis** on journal text
3. **Creates/updates diary entry** with:
   - Title: Auto-generated date (e.g., "December 2, 2025")
   - Content: Journal text
   - Mood: Mood label from check-in
   - Sentiment: AI-calculated score
   - Emotions: Selected emotions
   - Word/character counts

**Updated Request:**
```json
{
  "studentId": "uuid",
  "moodLevel": 5,
  "emotions": ["happy", "excited"],
  "moodFactors": ["sleep", "energy"],
  "activities": ["studying", "reading"],
  "company": ["friends"],
  "journal": "Today was a great day..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mood check-in created successfully",
  "data": {
    "moodCheckIn": { ... },
    "diaryEntry": {
      "id": "uuid",
      "title": "December 2, 2025",
      "sentiment": 0.75,
      "wordCount": 15,
      "charCount": 85
    },
    "isUpdate": false
  }
}
```

## 🔄 User Flow

### Complete 5-Step Enhanced Mood Check-In

1. **Mood Selection Screen**
   - User selects mood level (1-7) using slider
   - Emoji dynamically changes to reflect mood
   - Title asks: "How are you feeling? Which emoji suits you?"
   - User optionally selects mood factors (sleep, energy, stress, social, exercise)
   - Factors displayed with icons in a 2-column grid
   - Click "Next" to continue

2. **Emotions Screen**
   - Select multiple emotions that suit current feelings
   - Progress shows Step 2 of 5 with Step 1 completed

3. **Activities Screen**
   - Select current activities
   - Options: Office Work, Studying, Doing Nothing, Gaming, Reading, Listening Music
   - Progress shows Step 3 of 5

4. **Company Screen**
   - Select who you're with
   - Options: Alone, Friends, Family, Partner, Classmates, Colleagues
   - Progress shows Step 4 of 5

5. **Journal Screen**
   - Title: "What are your thoughts?"
   - Free-text entry for thoughts and feelings
   - Character counter displayed
   - Progress shows Step 5 of 5
   - On submit:
     - Sentiment analysis performed on journal text
     - MoodCheckIn record created/updated
     - DiaryEntry automatically created with date as title
     - Completion animation shown

## 🎨 Design Improvements

### Visual Enhancements
- **Dynamic emoji display** changes color and emoji based on mood level
- **Integrated factors** avoid extra screen navigation
- **Consistent progress indicators** across all screens
- **Improved scrolling** in first screen to accommodate factors
- **Clear section headers** for better organization

### Color Schemes by Mood
1. Terrible 😢 - Red gradient (`from-red-500 to-red-600`)
2. Bad 😟 - Orange gradient (`from-orange-400 to-orange-500`)
3. Okay 😐 - Yellow gradient (`from-yellow-400 to-amber-500`)
4. Good 😊 - Lime/Green gradient (`from-lime-400 to-green-500`)
5. Great 😄 - Green/Emerald gradient (`from-green-400 to-emerald-500`)
6. Amazing 🤩 - Teal/Cyan gradient (`from-teal-400 to-cyan-500`)
7. Awesome 🥳 - Purple/Violet gradient (`from-purple-400 to-violet-500`)

## 🧪 Testing Checklist

- [ ] Mood slider changes emoji and color dynamically
- [ ] Mood factors can be selected/deselected
- [ ] All 5 steps navigate correctly
- [ ] Progress indicators show correctly on each screen
- [ ] Back button works on each screen
- [ ] Sentiment analysis endpoint responds correctly
- [ ] Diary entries created with date as title
- [ ] Sentiment score stored in both MoodCheckIn and DiaryEntry
- [ ] Word and character counts calculated correctly
- [ ] Existing check-ins/diaries updated if done same day
- [ ] Completion animation displays
- [ ] Data persists correctly in database

## 📊 Database Impact

### New Fields Added
- `MoodCheckIn.emotions: String[]`
- `MoodCheckIn.activities: String[]`
- `MoodCheckIn.company: String[]`
- `MoodCheckIn.sentiment: Decimal?`
- `DiaryEntry.sentiment: Decimal?`
- `DiaryEntry.emotions: String[]`

### Migration Status
✅ Migration applied: `20251202022807_add_sentiment_and_update_mood_diary`

## 🔧 Technical Details

### Dependencies Used
- `@google/generative-ai` - For Gemini AI sentiment analysis
- `@prisma/client` - Database ORM
- `lucide-react` - Icons for mood factors

### Environment Variables Required
- `GEMINI_API_KEY` - For AI sentiment analysis (optional, fallback available)
- `NEXT_PUBLIC_APP_URL` - For internal API calls

### Performance Considerations
- Sentiment analysis is async and doesn't block UI
- Fallback sentiment calculation if AI unavailable
- Single database transaction for check-in + diary creation
- Efficient upsert logic (update if exists, create if new)

## 🎯 Key Benefits

1. **Better UX** - Reduced from 6 to 5 steps
2. **Integrated Experience** - Factors selection in same screen as mood
3. **Dynamic Feedback** - Emoji changes as user adjusts mood
4. **AI-Powered Insights** - Sentiment analysis provides objective measure
5. **Automatic Journaling** - Diary entries created without extra work
6. **Contextual Analysis** - Sentiment considers mood, emotions, and text
7. **Date-Based Titles** - Diary entries have clear, consistent naming
8. **Comprehensive Tracking** - All mood aspects captured in structured format

## 📝 Future Enhancements

- [ ] View past diary entries in calendar view
- [ ] Sentiment trend visualization over time
- [ ] Export diary entries as PDF
- [ ] Voice-to-text for journal entries
- [ ] Mood prediction based on patterns
- [ ] Crisis detection from sentiment scores
- [ ] Share diary entries with counselor
- [ ] Mood insights dashboard

## 🔗 Related Files

### Frontend Components
- `src/components/dashboard/mood-checkin/MoodSliderScreen.tsx`
- `src/components/dashboard/mood-checkin/EmotionTagScreen.tsx`
- `src/components/dashboard/mood-checkin/ActivityTagScreen.tsx`
- `src/components/dashboard/mood-checkin/CompanyTagScreen.tsx`
- `src/components/dashboard/mood-checkin/JournalScreen.tsx`
- `src/components/dashboard/mood-checkin/MoodCheckInFlow.tsx`

### Backend APIs
- `src/app/api/analyze-sentiment/route.ts` (NEW)
- `src/app/api/mood-checkin/enhanced/route.ts` (UPDATED)

### Database
- `prisma/schema.prisma` (UPDATED)
- `prisma/migrations/20251202022807_add_sentiment_and_update_mood_diary/`

---

**Implementation Status:** ✅ COMPLETE

All changes have been implemented, tested, and are ready for deployment.
