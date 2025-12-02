# Enhanced Mood Check-In Flow Diagram

## New 5-Step Flow Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 1: Mood & Factors                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  "How are you feeling? Which emoji suits you?"            │  │
│  │                                                             │  │
│  │  ┌─────────────┐                                           │  │
│  │  │   😊 Good   │  <- Emoji changes dynamically             │  │
│  │  └─────────────┘                                           │  │
│  │                                                             │  │
│  │  Mood Slider: [1 😢 ──●──── 7 🥳]                          │  │
│  │                                                             │  │
│  │  What's affecting your mood today? (Optional)              │  │
│  │  ┌──────────┐  ┌──────────┐                                │  │
│  │  │ 🌙 Sleep │  │ ⚡ Energy │                                │  │
│  │  └──────────┘  └──────────┘                                │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │  │
│  │  │ 🧠 Stress│  │ ❤️ Social │  │ 🏃 Exercise│                 │  │
│  │  └──────────┘  └──────────┘  └──────────┘                 │  │
│  │                                                             │  │
│  │  [●─○─○─○─○]  Progress: 1 of 5                             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      STEP 2: Emotions                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  "Which emotions are you feeling?"                         │  │
│  │                                                             │  │
│  │  [Happy] [Sad] [Anxious] [Excited] [Grateful]              │  │
│  │  [Angry] [Peaceful] [Stressed] [Loved] [Lonely]            │  │
│  │                                                             │  │
│  │  [●─●─○─○─○]  Progress: 2 of 5                             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     STEP 3: Activities                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  "What are you currently doing?"                           │  │
│  │                                                             │  │
│  │  [💼 Office Work] [📚 Studying] [🛋️ Doing Nothing]          │  │
│  │  [🎮 Gaming] [📖 Reading] [🎵 Listening Music]              │  │
│  │                                                             │  │
│  │  [●─●─●─○─○]  Progress: 3 of 5                             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      STEP 4: Company                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  "Who are you with right now?"                             │  │
│  │                                                             │  │
│  │  [😌 Alone] [👥 Friends] [👨‍👩‍👧 Family]                          │  │
│  │  [💑 Partner] [🎓 Classmates] [💼 Colleagues]                │  │
│  │                                                             │  │
│  │  [●─●─●─●─○]  Progress: 4 of 5                             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     STEP 5: Journal                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  "What are your thoughts?"                                 │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │ Share your thoughts about today...                  │   │  │
│  │  │ What made you feel this way?                        │   │  │
│  │  │                                                      │   │  │
│  │  │                                                      │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  │                                         150 characters      │  │
│  │                                                             │  │
│  │  [●─●─●─●─●]  Progress: 5 of 5                             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND PROCESSING                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  1. Perform AI Sentiment Analysis                          │  │
│  │     - Send journal text to /api/analyze-sentiment          │  │
│  │     - Get sentiment score (-1 to 1)                        │  │
│  │                                                             │  │
│  │  2. Create/Update MoodCheckIn Record                       │  │
│  │     - moodScore: 5                                         │  │
│  │     - moodLabel: "Great"                                   │  │
│  │     - factors: ["sleep", "energy"]                         │  │
│  │     - emotions: ["happy", "excited"]                       │  │
│  │     - activities: ["studying", "reading"]                  │  │
│  │     - company: ["friends"]                                 │  │
│  │     - sentiment: 0.75                                      │  │
│  │     - notes: "Today was a great day..."                    │  │
│  │                                                             │  │
│  │  3. Create/Update DiaryEntry Record                        │  │
│  │     - title: "December 2, 2025" (auto-generated)           │  │
│  │     - content: journal text                                │  │
│  │     - mood: "Great"                                        │  │
│  │     - sentiment: 0.75                                      │  │
│  │     - emotions: ["happy", "excited"]                       │  │
│  │     - wordCount: 15                                        │  │
│  │     - charCount: 85                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   COMPLETION ANIMATION                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                         😊                                 │  │
│  │                                                             │  │
│  │          We've captured your mood Today!                   │  │
│  │                                                             │  │
│  │                    ● ● ●  Loading...                       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Changes from Previous Flow

### Before (6 Steps)
1. Mood Slider
2. Emotions
3. **Mood Factors** (Separate Screen)
4. Activities
5. Company
6. Journal

### After (5 Steps) ✅
1. **Mood Slider + Factors** (Combined)
2. Emotions
3. Activities
4. Company
5. Journal

## Data Flow

```
User Input
    ↓
┌─────────────────────────────┐
│  MoodCheckInFlow            │
│  (State Management)         │
│                             │
│  checkInData:               │
│  - moodLevel: number        │
│  - moodFactors: string[]    │ <- NEW: From Step 1
│  - emotions: string[]       │
│  - activities: string[]     │
│  - company: string[]        │
│  - journal: string          │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│  POST /api/mood-checkin/    │
│  enhanced                   │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│  POST /api/analyze-         │
│  sentiment                  │
│  (if journal exists)        │
│                             │
│  Input:                     │
│  - text: journal            │
│  - emotions: []             │
│  - moodLevel: number        │
│                             │
│  Output:                    │
│  - score: -1 to 1           │
│  - label: pos/neg/neutral   │
│  - confidence: 0 to 1       │
│  - analysis: string         │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│  Database Updates           │
│                             │
│  1. MoodCheckIn             │
│     ✅ Created/Updated      │
│                             │
│  2. DiaryEntry              │
│     ✅ Created/Updated      │
│     (if journal exists)     │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│  Response to Client         │
│                             │
│  - moodCheckIn: {...}       │
│  - diaryEntry: {...}        │
│  - isUpdate: boolean        │
└─────────────────────────────┘
```

## Sentiment Analysis Details

```
Journal Text Input
    ↓
┌──────────────────────────────────────┐
│  AI Analysis (Gemini 1.5 Flash)     │
│                                      │
│  Considers:                          │
│  - Text content                      │
│  - Selected emotions                 │
│  - Mood level (1-7)                  │
│                                      │
│  Returns:                            │
│  - Sentiment score (-1.0 to 1.0)     │
│    * < -0.3 = Negative              │
│    * -0.3 to 0.3 = Neutral          │
│    * > 0.3 = Positive               │
└──────────────────────────────────────┘
    ↓
┌──────────────────────────────────────┐
│  Fallback (if AI unavailable)       │
│                                      │
│  Rule-based calculation:             │
│  1. Base score from mood level       │
│     (1→-1, 4→0, 7→1)                │
│  2. Adjust based on emotions         │
│     - Negative emotions: -0.1        │
│     - Positive emotions: +0.1        │
│  3. Clamp to [-1, 1]                 │
└──────────────────────────────────────┘
    ↓
Stored in both MoodCheckIn & DiaryEntry
```

## Benefits Summary

✅ **Reduced Steps** - From 6 to 5 (17% reduction)
✅ **Integrated UX** - Factors in same screen as mood
✅ **Dynamic Feedback** - Real-time emoji updates
✅ **AI-Powered** - Sentiment analysis with Gemini
✅ **Auto-Journaling** - Diary entries created automatically
✅ **Date-Based Titles** - Consistent diary naming
✅ **Comprehensive Data** - All aspects captured structurally
✅ **Fallback Support** - Works without AI available
