// /lib/rateLimiter.ts
// Rate limiting for community posts and replies

interface RateLimitConfig {
  maxPostsPerHour: number;
  maxRepliesPerHour: number;
  maxPostsPerDay: number;
  maxRepliesPerDay: number;
  cooldownMinutes: number; // Cooldown after hitting limit
}

interface RateLimitEntry {
  userId: string;
  posts: string[];      // Timestamps of recent posts
  replies: string[];    // Timestamps of recent replies
  lastWarning?: string; // Last warning timestamp
  isBanned?: boolean;
  bannedUntil?: string;
}

// In-memory storage (for production, use Redis or DynamoDB)
const rateLimitCache = new Map<string, RateLimitEntry>();

// Default rate limits
const DEFAULT_LIMITS: RateLimitConfig = {
  maxPostsPerHour: 5,
  maxRepliesPerHour: 20,
  maxPostsPerDay: 15,
  maxRepliesPerDay: 50,
  cooldownMinutes: 15,
};

/**
 * Clean up old timestamps from rate limit entry
 */
function cleanupTimestamps(timestamps: string[], hoursToKeep: number): string[] {
  const cutoff = Date.now() - hoursToKeep * 60 * 60 * 1000;
  return timestamps.filter(ts => new Date(ts).getTime() > cutoff);
}

/**
 * Get or create rate limit entry for user
 */
function getRateLimitEntry(userId: string): RateLimitEntry {
  let entry = rateLimitCache.get(userId);
  
  if (!entry) {
    entry = {
      userId,
      posts: [],
      replies: [],
    };
    rateLimitCache.set(userId, entry);
  }
  
  // Clean up old timestamps
  entry.posts = cleanupTimestamps(entry.posts, 24);
  entry.replies = cleanupTimestamps(entry.replies, 24);
  
  return entry;
}

/**
 * Check if user can create a post
 */
export function canCreatePost(
  userId: string,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; reason?: string; retryAfter?: number } {
  const limits = { ...DEFAULT_LIMITS, ...config };
  const entry = getRateLimitEntry(userId);
  
  // Check if user is banned
  if (entry.isBanned && entry.bannedUntil) {
    const bannedUntil = new Date(entry.bannedUntil).getTime();
    if (Date.now() < bannedUntil) {
      const minutesLeft = Math.ceil((bannedUntil - Date.now()) / 60000);
      return {
        allowed: false,
        reason: `You are temporarily banned from posting. Try again in ${minutesLeft} minutes.`,
        retryAfter: minutesLeft,
      };
    } else {
      // Ban expired
      entry.isBanned = false;
      entry.bannedUntil = undefined;
    }
  }
  
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  
  // Count recent posts
  const postsLastHour = entry.posts.filter(
    ts => new Date(ts).getTime() > oneHourAgo
  ).length;
  
  const postsLastDay = entry.posts.filter(
    ts => new Date(ts).getTime() > oneDayAgo
  ).length;
  
  // Check hourly limit
  if (postsLastHour >= limits.maxPostsPerHour) {
    const oldestPost = entry.posts
      .filter(ts => new Date(ts).getTime() > oneHourAgo)
      .sort()[0];
    const retryAfter = Math.ceil(
      (new Date(oldestPost).getTime() + 60 * 60 * 1000 - now) / 60000
    );
    
    return {
      allowed: false,
      reason: `You've reached the hourly limit of ${limits.maxPostsPerHour} posts. Please wait ${retryAfter} minutes.`,
      retryAfter,
    };
  }
  
  // Check daily limit
  if (postsLastDay >= limits.maxPostsPerDay) {
    const oldestPost = entry.posts
      .filter(ts => new Date(ts).getTime() > oneDayAgo)
      .sort()[0];
    const retryAfter = Math.ceil(
      (new Date(oldestPost).getTime() + 24 * 60 * 60 * 1000 - now) / 60000
    );
    
    return {
      allowed: false,
      reason: `You've reached the daily limit of ${limits.maxPostsPerDay} posts. Please try again tomorrow.`,
      retryAfter,
    };
  }
  
  return { allowed: true };
}

/**
 * Check if user can create a reply
 */
export function canCreateReply(
  userId: string,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; reason?: string; retryAfter?: number } {
  const limits = { ...DEFAULT_LIMITS, ...config };
  const entry = getRateLimitEntry(userId);
  
  // Check if user is banned
  if (entry.isBanned && entry.bannedUntil) {
    const bannedUntil = new Date(entry.bannedUntil).getTime();
    if (Date.now() < bannedUntil) {
      const minutesLeft = Math.ceil((bannedUntil - Date.now()) / 60000);
      return {
        allowed: false,
        reason: `You are temporarily banned from replying. Try again in ${minutesLeft} minutes.`,
        retryAfter: minutesLeft,
      };
    } else {
      entry.isBanned = false;
      entry.bannedUntil = undefined;
    }
  }
  
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  
  const repliesLastHour = entry.replies.filter(
    ts => new Date(ts).getTime() > oneHourAgo
  ).length;
  
  const repliesLastDay = entry.replies.filter(
    ts => new Date(ts).getTime() > oneDayAgo
  ).length;
  
  if (repliesLastHour >= limits.maxRepliesPerHour) {
    const oldestReply = entry.replies
      .filter(ts => new Date(ts).getTime() > oneHourAgo)
      .sort()[0];
    const retryAfter = Math.ceil(
      (new Date(oldestReply).getTime() + 60 * 60 * 1000 - now) / 60000
    );
    
    return {
      allowed: false,
      reason: `You've reached the hourly limit of ${limits.maxRepliesPerHour} replies. Please wait ${retryAfter} minutes.`,
      retryAfter,
    };
  }
  
  if (repliesLastDay >= limits.maxRepliesPerDay) {
    const oldestReply = entry.replies
      .filter(ts => new Date(ts).getTime() > oneDayAgo)
      .sort()[0];
    const retryAfter = Math.ceil(
      (new Date(oldestReply).getTime() + 24 * 60 * 60 * 1000 - now) / 60000
    );
    
    return {
      allowed: false,
      reason: `You've reached the daily limit of ${limits.maxRepliesPerDay} replies. Please try again tomorrow.`,
      retryAfter,
    };
  }
  
  return { allowed: true };
}

/**
 * Record that user created a post
 */
export function recordPost(userId: string): void {
  const entry = getRateLimitEntry(userId);
  entry.posts.push(new Date().toISOString());
  rateLimitCache.set(userId, entry);
}

/**
 * Record that user created a reply
 */
export function recordReply(userId: string): void {
  const entry = getRateLimitEntry(userId);
  entry.replies.push(new Date().toISOString());
  rateLimitCache.set(userId, entry);
}

/**
 * Ban user temporarily (for spam/abuse)
 */
export function banUser(userId: string, durationMinutes: number): void {
  const entry = getRateLimitEntry(userId);
  entry.isBanned = true;
  entry.bannedUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
  rateLimitCache.set(userId, entry);
}

/**
 * Unban user
 */
export function unbanUser(userId: string): void {
  const entry = getRateLimitEntry(userId);
  entry.isBanned = false;
  entry.bannedUntil = undefined;
  rateLimitCache.set(userId, entry);
}

/**
 * Get rate limit stats for user
 */
export function getRateLimitStats(userId: string) {
  const entry = getRateLimitEntry(userId);
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  
  return {
    postsLastHour: entry.posts.filter(ts => new Date(ts).getTime() > oneHourAgo).length,
    postsLastDay: entry.posts.filter(ts => new Date(ts).getTime() > oneDayAgo).length,
    repliesLastHour: entry.replies.filter(ts => new Date(ts).getTime() > oneHourAgo).length,
    repliesLastDay: entry.replies.filter(ts => new Date(ts).getTime() > oneDayAgo).length,
    isBanned: entry.isBanned || false,
    bannedUntil: entry.bannedUntil,
    limits: DEFAULT_LIMITS,
  };
}

/**
 * Clear rate limit for user (admin function)
 */
export function clearRateLimit(userId: string): void {
  rateLimitCache.delete(userId);
}
