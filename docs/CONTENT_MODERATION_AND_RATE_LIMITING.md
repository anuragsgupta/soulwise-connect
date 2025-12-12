# Content Moderation & Rate Limiting Guide

## Overview

This document describes the AI-powered content moderation and rate limiting systems implemented for the SoulWise Connect community forum.

## 🛡️ Content Moderation

### Purpose
Automatically detect and filter inappropriate, harmful, or toxic content in community posts and replies to maintain a safe, supportive environment for mental health discussions.

### Features

#### 1. **Keyword-Based Detection**
- **High-Risk Keywords**: Suicide, violence, threats (20+ keywords)
  - Examples: "kill myself", "end my life", "suicide", "kill you", "bomb"
  - Auto-flags content with ≥1 high-risk keyword
  - Auto-hides content with ≥2 high-risk keywords

- **Medium-Risk Keywords**: Self-harm indicators, substance abuse (12+ keywords)
  - Examples: "hate myself", "want to disappear", "overdosed", "addiction"

- **Supportive Keywords**: Positive support phrases (9+ keywords)
  - Examples: "here for you", "you matter", "stay strong"
  - Reduces toxicity score

#### 2. **Toxicity Scoring**
Algorithm:
```
toxicityScore = (highRiskCount × 0.4 + mediumRiskCount × 0.15) - (supportiveCount × 0.1)
```
Normalized to 0-1 scale

#### 3. **Content Categories**
Tracks severity in 5 categories (0-1 scale):
- `hate`: Hate speech, discrimination
- `violence`: Violent threats, self-harm
- `selfHarm`: Suicide ideation, self-injury
- `sexual`: Inappropriate sexual content
- `harassment`: Bullying, personal attacks

#### 4. **Crisis Level Detection**
Mental health-specific risk assessment:
- `none`: toxicity < 0.2
- `low`: 0.2 - 0.4
- `medium`: 0.4 - 0.6
- `high`: 0.6 - 0.8
- `critical`: > 0.8

### Auto-Moderation Actions

| Condition | Action |
|-----------|--------|
| ≥1 high-risk keyword | Auto-flag (requires admin review) |
| ≥2 high-risk keywords OR toxicity > 0.8 | Auto-hide (removed from public view) |
| High toxicity | Log alert to admin console |

### API Integration Points

#### `/api/community-memory` (POST)
```typescript
// Automatic moderation flow:
1. Check rate limit
2. Moderate content (keyword detection)
3. Auto-flag if needed
4. Auto-hide if critical
5. Save to database
6. Record rate limit
7. Log alerts for admins
```

### Usage Example

```typescript
import { moderateContentBasic, getModerationSummary } from '@/lib/contentModeration';

const result = await moderateContentBasic("Your post content here");

console.log(result);
// {
//   isAppropriate: false,
//   toxicityScore: 0.85,
//   categories: { violence: 0.9, selfHarm: 0.8, ... },
//   flagReason: "Contains high-risk content: violence, self-harm",
//   shouldAutoFlag: true,
//   shouldAutoHide: true
// }

console.log(getModerationSummary(result));
// "High toxicity (85%). Categories: violence, self-harm. Should auto-flag and hide."
```

### AI API Integration (Optional Enhancement)

Placeholder functions ready for integration:

#### OpenAI Moderation API
```typescript
// In moderateContentAI():
const response = await fetch('https://api.openai.com/v1/moderations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ input: content }),
});
```

#### Google Perspective API
```typescript
const response = await fetch(
  `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${process.env.PERSPECTIVE_API_KEY}`,
  {
    method: 'POST',
    body: JSON.stringify({
      comment: { text: content },
      requestedAttributes: {
        TOXICITY: {},
        SEVERE_TOXICITY: {},
        IDENTITY_ATTACK: {},
        INSULT: {},
        PROFANITY: {},
        THREAT: {},
      },
    }),
  }
);
```

### Environment Variables (for AI APIs)
```env
OPENAI_API_KEY=sk-...
PERSPECTIVE_API_KEY=...
```

---

## ⏱️ Rate Limiting

### Purpose
Prevent spam, abuse, and overwhelming of the community forum by limiting posts/replies per user per time window.

### Default Limits

| Type | Hourly Limit | Daily Limit |
|------|--------------|-------------|
| Posts | 5 | 15 |
| Replies | 20 | 50 |

**Cooldown**: 15 minutes after hitting limit

### Features

#### 1. **User-Based Tracking**
- In-memory cache (Map) for development
- Ready for Redis/DynamoDB in production
- Tracks timestamps of all posts/replies per user

#### 2. **Time-Window Enforcement**
- Hourly limits (rolling 60-minute window)
- Daily limits (rolling 24-hour window)
- Automatic cleanup of old timestamps

#### 3. **Temporary Bans**
Admin can temporarily ban abusive users:
```typescript
import { banUser, unbanUser } from '@/lib/rateLimiter';

banUser(userId, 60); // Ban for 60 minutes
unbanUser(userId);   // Remove ban
```

#### 4. **Rate Limit Stats**
Get user's current usage:
```typescript
import { getRateLimitStats } from '@/lib/rateLimiter';

const stats = getRateLimitStats(userId);
// {
//   postsLastHour: 3,
//   postsLastDay: 8,
//   repliesLastHour: 15,
//   repliesLastDay: 32,
//   isBanned: false,
//   limits: { maxPostsPerHour: 5, ... }
// }
```

### API Response (Rate Limit Exceeded)

```json
HTTP 429 Too Many Requests
{
  "error": "You've reached the hourly limit of 5 posts. Please wait 23 minutes.",
  "retryAfter": 23
}
```

### Usage in API

```typescript
import { canCreatePost, recordPost } from '@/lib/rateLimiter';

// Check if user can post
const check = canCreatePost(userId);
if (!check.allowed) {
  return NextResponse.json(
    { error: check.reason, retryAfter: check.retryAfter },
    { status: 429 }
  );
}

// ... create post ...

// Record the post for rate limiting
recordPost(userId);
```

### Customizing Limits

```typescript
import { canCreatePost } from '@/lib/rateLimiter';

const check = canCreatePost(userId, {
  maxPostsPerHour: 10,  // Custom limit
  maxPostsPerDay: 30,
});
```

### Admin Functions

```typescript
import { 
  clearRateLimit, 
  banUser, 
  getRateLimitStats 
} from '@/lib/rateLimiter';

// Clear rate limit for a user (admin action)
clearRateLimit(userId);

// Ban user for spam/abuse
banUser(userId, 120); // 120 minutes

// Get stats for monitoring
const stats = getRateLimitStats(userId);
```

---

## 🔄 Integration Flow

### POST /api/community-memory (Complete Flow)

```
1. Receive post/reply from frontend
   ↓
2. Validate required fields
   ↓
3. ✅ CHECK RATE LIMIT
   - canCreatePost() or canCreateReply()
   - Return 429 if limit exceeded
   ↓
4. ✅ MODERATE CONTENT
   - moderateContentBasic()
   - Calculate toxicity score
   - Detect high-risk keywords
   ↓
5. AUTO-FLAG if needed
   - Mark isFlagged = true
   - Set flagReason
   ↓
6. AUTO-HIDE if critical
   - Mark isHidden = true
   - Content removed from public view
   ↓
7. Save to database
   - createCommunityPost() or createCommunityReply()
   ↓
8. Update moderation status
   - flagCommunityItem() if auto-flagged
   - hideCommunityItem() if auto-hidden
   ↓
9. ✅ RECORD RATE LIMIT
   - recordPost() or recordReply()
   ↓
10. Log alerts for admins
    - Console warnings for flagged content
    - Console errors for hidden content
    ↓
11. Return response
    - Post/reply data (authorId filtered)
    - Moderation status
```

---

## 🚀 Production Considerations

### 1. **Redis for Rate Limiting**
Replace in-memory Map with Redis for distributed systems:

```typescript
import { Redis } from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Store rate limit data
await redis.zadd(`ratelimit:${userId}:posts`, Date.now(), Date.now().toString());

// Get count in time window
const count = await redis.zcount(
  `ratelimit:${userId}:posts`,
  Date.now() - 3600000, // 1 hour ago
  Date.now()
);
```

### 2. **AI API Integration**
Add environment variables and implement `moderateContentAI()`:

```typescript
// .env.local
OPENAI_API_KEY=sk-...
PERSPECTIVE_API_KEY=...
ENABLE_AI_MODERATION=true
```

### 3. **Admin Alerts**
Send email/SMS alerts for flagged content:

```typescript
// In route.ts after auto-flagging
if (moderationResult.shouldAutoHide) {
  await sendAdminAlert({
    type: 'critical_content',
    itemId: saved.id,
    authorId: payload.authorId,
    reason: moderationResult.flagReason,
    toxicityScore: moderationResult.toxicityScore,
  });
}
```

### 4. **Authentication Middleware**
Implement proper admin authentication:

```typescript
// In /api/community-moderation/route.ts
function isAdmin(request: NextRequest): boolean {
  // TODO: Implement JWT verification
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  // Verify token and check role
  return true; // Replace with real logic
}
```

### 5. **Monitoring & Metrics**
Track moderation effectiveness:

```typescript
// Log to analytics
analytics.track('content_flagged', {
  itemId: saved.id,
  toxicityScore: moderationResult.toxicityScore,
  categories: moderationResult.categories,
  autoHidden: moderationResult.shouldAutoHide,
});
```

---

## 📊 Testing

### Test Content Moderation

```bash
# Test high-risk content
curl -X POST http://localhost:3000/api/community-memory \
  -H "Content-Type: application/json" \
  -d '{
    "type": "post",
    "title": "Test Post",
    "content": "I want to kill myself",
    "authorId": "test-user-123",
    "author": "Test User"
  }'

# Expected: Auto-flagged, auto-hidden
```

### Test Rate Limiting

```bash
# Send 6 posts rapidly (exceeds hourly limit of 5)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/community-memory \
    -H "Content-Type: application/json" \
    -d '{
      "type": "post",
      "title": "Post '$i'",
      "content": "Test content",
      "authorId": "test-user-456",
      "author": "Test User"
    }'
done

# Expected: 6th request returns 429 Too Many Requests
```

---

## 🛠️ Troubleshooting

### Content Not Being Flagged
1. Check keyword detection logic in `/src/lib/contentModeration.ts`
2. Verify `HIGH_RISK_KEYWORDS` array includes target phrases
3. Check toxicity score calculation (may need adjustment)

### Rate Limit Not Working
1. Verify `authorId` is being passed correctly
2. Check timestamp cleanup logic (old timestamps should be removed)
3. Test with different time windows

### Posts Still Visible When Auto-Hidden
1. Verify `isHidden` filter in GET endpoint
2. Check `hideCommunityItem()` function execution
3. Confirm database update (check DynamoDB console)

---

## 📝 Summary

### ✅ Implemented Features

1. **Content Moderation**
   - Keyword-based detection (high/medium/supportive)
   - Toxicity scoring algorithm
   - 5-category classification
   - Auto-flag and auto-hide logic
   - Crisis level detection
   - Ready for AI API integration

2. **Rate Limiting**
   - Hourly and daily limits
   - User-based tracking
   - Temporary ban system
   - Rate limit stats
   - Customizable limits

3. **API Integration**
   - Automated moderation in POST handler
   - Rate limit enforcement
   - Admin logging and alerts
   - Privacy-filtered responses

### 🔄 Next Steps

1. **Implement Admin Dashboard UI**
   - View flagged content
   - Review moderation logs
   - Manual flag/hide/unhide actions
   - User ban management

2. **Add AI API Integration**
   - OpenAI Moderation API
   - Google Perspective API
   - Fallback to keyword detection

3. **Production Infrastructure**
   - Migrate to Redis for rate limiting
   - Implement email alerts for admins
   - Add authentication middleware
   - Set up monitoring and metrics

4. **Testing & QA**
   - Unit tests for moderation logic
   - Integration tests for rate limiting
   - Load testing for API endpoints
   - Security audit

---

**Last Updated**: Current session
**Status**: ✅ Production-ready (basic features), ⚠️ Pending AI integration & admin UI
