# Community Forum - Privacy & Moderation System

## 🔒 Security Model Overview

The community forum implements a **balanced approach** between user privacy and platform safety:

### ✅ **What Users See (Public View)**
- Anonymous posts show as **"Anonymous User"**
- `authorId` is **NEVER exposed** in public API responses
- IP addresses and user agents are **NEVER exposed** to regular users
- Hidden/flagged content is automatically filtered out

### ⚠️ **What Admins/Moderators See (Admin Panel)**
- **Full user identity** (`authorId`) even for anonymous posts
- **IP address** (if logged) for tracking abusive users
- **User agent** (browser info) for detecting automated abuse
- **Flag history** and moderation actions
- **Timestamp trail** of all actions

---

## 📊 Database Schema

### CommunityPostDB / CommunityReplyDB

```typescript
{
  // Public fields
  id: "post_abc123",
  content: "I'm struggling with anxiety",
  author: "Anonymous User",        // Masked if isAnonymous=true
  isAnonymous: true,
  
  // ⚠️ Admin-only fields (never sent to public API)
  authorId: "user_456_student",    // Real user ID - tracked internally
  ipAddress: "192.168.1.100",      // Optional tracking
  userAgent: "Mozilla/5.0...",     // Optional tracking
  
  // Moderation fields
  isFlagged: false,
  flagReason: "",
  isHidden: false,
  moderatorId: "admin_789",
  moderatedAt: "2025-11-24T..."
}
```

---

## 🔐 Privacy Protection

### 1. **API Response Filtering**

**Public Endpoint** (`/api/community-memory`):
```typescript
// ✅ SAFE - No authorId exposed
{
  posts: [
    {
      id: "post_123",
      author: "Anonymous User",  // Masked
      content: "...",
      // authorId NOT included ❌
    }
  ]
}
```

**Admin Endpoint** (`/api/community-moderation`):
```typescript
// ⚠️ ADMIN ONLY - Full details
{
  posts: [
    {
      id: "post_123",
      author: "Anonymous User",
      authorId: "user_456_student",  // ✅ Included for tracking
      ipAddress: "192.168.1.100",
      content: "..."
    }
  ]
}
```

### 2. **Database Storage**

```typescript
// ALWAYS store authorId in DynamoDB
const post = {
  authorId: "user_456_student",    // ✅ Required for tracking
  author: "Jane Doe",              // Display name
  isAnonymous: true,               // Public flag
  // ...
};
```

**Why store `authorId` even for anonymous posts?**
- Enables admin intervention for harmful content
- Prevents abuse and spam
- Allows pattern detection (same user repeatedly posting evil content)
- Legal compliance (can provide info to authorities if needed)

---

## 🚨 Moderation Capabilities

### For Admins/Moderators

#### 1. **View All Content with Identity**
```bash
GET /api/community-moderation
Authorization: Bearer <admin_token>
```

Returns:
- All posts/replies with `authorId`
- IP addresses and user agents
- Flag/moderation history

#### 2. **Flag Inappropriate Content**
```bash
POST /api/community-moderation
{
  "action": "flag",
  "itemId": "post_123",
  "reason": "Contains threatening language",
  "moderatorId": "admin_789"
}
```

#### 3. **Hide Content from Public**
```bash
POST /api/community-moderation
{
  "action": "hide",
  "itemId": "post_123",
  "moderatorId": "admin_789"
}
```

Hidden posts:
- ✅ Still in database (for audit trail)
- ❌ Not visible in public API
- ✅ Visible in admin panel

#### 4. **Unhide Content**
```bash
POST /api/community-moderation
{
  "action": "unhide",
  "itemId": "post_123",
  "moderatorId": "admin_789"
}
```

#### 5. **View Flagged Items**
```bash
GET /api/community-moderation?action=flagged
```

---

## 🛡️ Abuse Prevention Strategies

### 1. **User Tracking (Backend Only)**
```typescript
createCommunityPost({
  authorId: "user_456_student",     // Real identity
  isAnonymous: true,                // Public anonymity
  ipAddress: req.headers.get("x-forwarded-for"),  // Optional
  userAgent: req.headers.get("user-agent"),       // Optional
});
```

### 2. **Pattern Detection**
Admins can query:
```sql
-- Find all posts by same user
SELECT * FROM CommunityTable 
WHERE authorId = 'user_456_student'

-- Find posts from same IP
SELECT * FROM CommunityTable 
WHERE ipAddress = '192.168.1.100'
```

### 3. **Automated Content Filtering**
```typescript
// TODO: Integrate AI content moderation
const toxicityScore = await moderateContent(post.content);
if (toxicityScore > 0.8) {
  await flagCommunityItem(post.id, "Auto-flagged: High toxicity", "system");
}
```

### 4. **Rate Limiting**
```typescript
// TODO: Implement rate limiting
// Prevent spam: max 10 posts per user per hour
```

---

## 🔨 Implementation Checklist

### ✅ **Current Implementation**
- [x] Store `authorId` in all posts/replies
- [x] Filter `authorId` from public API responses
- [x] Mask author name for anonymous posts
- [x] Admin API with full details
- [x] Flag/hide/unhide functions
- [x] Moderation tracking (moderatorId, timestamp)

### ⚠️ **TODO: Security Enhancements**
- [ ] **Authentication middleware** for admin endpoints
- [ ] **Role-based access control** (RBAC)
- [ ] **IP address logging** (with user consent)
- [ ] **AI content moderation** integration
- [ ] **Rate limiting** per user
- [ ] **Email notifications** to admins for flagged content
- [ ] **Audit log** for all moderation actions
- [ ] **User reporting** feature (let users flag content)

---

## 📝 Usage Examples

### For Developers

#### Public API (Frontend)
```typescript
// Load posts - no authorId exposed
const res = await fetch('/api/community-memory');
const { posts, replies } = await res.json();

// posts[0].authorId → undefined ✅
// posts[0].author → "Anonymous User" if anonymous
```

#### Admin API (Admin Panel)
```typescript
// Load all posts with tracking info
const res = await fetch('/api/community-moderation', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const { posts, replies } = await res.json();

// posts[0].authorId → "user_456_student" ✅
// posts[0].ipAddress → "192.168.1.100" ✅
```

#### Flag Evil Content
```typescript
// User posts: "I will harm myself and others"
// Admin reviews and flags:

await fetch('/api/community-moderation', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'flag',
    itemId: 'post_evil_123',
    reason: 'Contains threats of violence',
    moderatorId: 'admin_789'
  })
});

// Now admin can see:
// authorId: "user_456_student"
// Contact student support services
// Report to authorities if necessary
```

---

## 🎯 Best Practices

### 1. **For Users**
- ✅ Anonymous posting protects your identity in public
- ⚠️ Platform admins can identify you if content violates policies
- 📝 Follow community guidelines and mental health support etiquette

### 2. **For Admins**
- ✅ Only access `authorId` when investigating reports
- ⚠️ Document all moderation actions
- 📝 Maintain confidentiality of user identities
- 🚨 Escalate serious threats to appropriate authorities

### 3. **For Developers**
- ✅ Never expose `authorId` in public APIs
- ⚠️ Always authenticate admin endpoints
- 📝 Log all moderation actions for accountability
- 🔒 Use environment variables for sensitive configs

---

## 🚀 Deployment Checklist

Before going to production:

1. **Implement authentication** for `/api/community-moderation`
   ```typescript
   const isAdmin = await verifyAdminToken(request);
   if (!isAdmin) return 403;
   ```

2. **Add rate limiting**
   ```typescript
   const userPostCount = await getRecentPostCount(userId);
   if (userPostCount > 10) return 429; // Too many requests
   ```

3. **Set up admin dashboard** UI for moderation

4. **Configure environment variables**
   ```env
   ADMIN_SECRET_TOKEN=your-secret-token
   ENABLE_IP_LOGGING=true
   CONTENT_MODERATION_API_KEY=your-key
   ```

5. **Legal compliance**
   - Privacy policy disclosure
   - Terms of service
   - User consent for data collection

---

## 📞 Support & Questions

- **Security concerns**: Report to security@yourapp.com
- **Moderation requests**: admin@yourapp.com
- **Technical issues**: dev-team@yourapp.com

---

**Last Updated**: November 24, 2025  
**Version**: 1.0.0  
**Status**: Ready for testing, needs auth implementation before production
