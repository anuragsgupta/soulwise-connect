/**
 * Complete Demo Student System Using IndexedDB
 * All demo data stored locally in browser IndexedDB
 */

import { DemoMoodCheckIn, DemoNotification, DemoSession } from './mockData';

const DB_NAME = 'DemoStudentDB';
const DB_VERSION = 3;

// Store names
const STORES = {
  USER: 'demoUser',
  MOOD_CHECKINS: 'moodCheckIns',
  NOTIFICATIONS: 'notifications',
  SESSIONS: 'sessions',
  API_KEY: 'apiKey',
  COMMUNITY_POSTS: 'communityPosts',
  GAD7_SURVEYS: 'gad7Surveys',
  PHQ9_SURVEYS: 'phq9Surveys',
};

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize demo database
 */
export async function initializeDemoDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB not available in server environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open demo database'));
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores for all demo data
      const stores = Object.values(STORES);
      stores.forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          if (store === STORES.MOOD_CHECKINS || store === STORES.COMMUNITY_POSTS || 
              store === STORES.NOTIFICATIONS || store === STORES.SESSIONS ||
              store === STORES.GAD7_SURVEYS || store === STORES.PHQ9_SURVEYS) {
            db.createObjectStore(store, { keyPath: 'id' });
          } else {
            db.createObjectStore(store);
          }
        }
      });
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };
  });
}

/**
 * Save Gemini API Key to IndexedDB
 */
export async function saveDemoGeminiApiKey(apiKey: string): Promise<void> {
  const db = await initializeDemoDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.API_KEY], 'readwrite');
    const store = transaction.objectStore(STORES.API_KEY);

    const request = store.put(
      {
        key: apiKey,
        lastUpdated: new Date().toISOString(),
      },
      'gemini'
    );

    request.onsuccess = () => {
      console.log('✅ Demo Gemini API key saved to IndexedDB');
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to save API key'));
    };
  });
}

/**
 * Get Gemini API Key from IndexedDB
 */
export async function getDemoGeminiApiKey(): Promise<string | null> {
  const db = await initializeDemoDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.API_KEY], 'readonly');
    const store = transaction.objectStore(STORES.API_KEY);

    const request = store.get('gemini');

    request.onsuccess = (event) => {
      const result = (event.target as IDBRequest).result;
      if (result?.key) {
        console.log('✅ Retrieved demo Gemini API key from IndexedDB');
        resolve(result.key);
      } else {
        resolve(null);
      }
    };

    request.onerror = () => {
      reject(new Error('Failed to retrieve API key'));
    };
  });
}

/**
 * Initialize all demo data (mood checkins, notifications, sessions, community posts)
 */
export async function initializeDemoData(studentId: string = 'demo-student-123'): Promise<void> {
  const db = await initializeDemoDatabase();

  // Check if already initialized
  const hasData = await checkIfDemoDataExists();
  if (hasData) {
    await ensureDemoSurveySamples(studentId);
    return;
  }

  console.log('📊 Initializing demo data for demo student...');

  // Generate 3 days of mood check-ins
  const moodCheckIns = generateThreeDaysMoodCheckIns();

  // Generate notifications
  const notifications = generateDemoNotifications();

  // Generate sessions
  const sessions = generateDemoSessions();

  // Generate community posts
  const communityPosts = generateDemoCommunityPosts();
  const { gad7Surveys, phq9Surveys } = generateDemoSurveySamples(studentId);

  // Save all data
  const transaction = db.transaction(
    [
      STORES.MOOD_CHECKINS,
      STORES.NOTIFICATIONS,
      STORES.SESSIONS,
      STORES.COMMUNITY_POSTS,
      STORES.GAD7_SURVEYS,
      STORES.PHQ9_SURVEYS,
      STORES.USER,
    ],
    'readwrite'
  );

  // Save mood check-ins
  const moodStore = transaction.objectStore(STORES.MOOD_CHECKINS);
  moodCheckIns.forEach((checkIn) => moodStore.add(checkIn));

  // Save notifications
  const notifStore = transaction.objectStore(STORES.NOTIFICATIONS);
  notifications.forEach((notif) => notifStore.add(notif));

  // Save sessions
  const sessionStore = transaction.objectStore(STORES.SESSIONS);
  sessions.forEach((session) => sessionStore.add(session));

  // Save community posts
  const communityStore = transaction.objectStore(STORES.COMMUNITY_POSTS);
  communityPosts.forEach((post) => communityStore.add(post));

  const gad7Store = transaction.objectStore(STORES.GAD7_SURVEYS);
  gad7Surveys.forEach((survey) => gad7Store.add(survey));

  const phq9Store = transaction.objectStore(STORES.PHQ9_SURVEYS);
  phq9Surveys.forEach((survey) => phq9Store.add(survey));

  // Save user
  const userStore = transaction.objectStore(STORES.USER);
  userStore.put(
    {
      userId: studentId,
      name: 'Demo Student',
      email: 'demo@example.com',
      avatar: '👤',
      createdAt: new Date().toISOString(),
    },
    'profile'
  );

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      console.log('✅ Demo data initialized successfully');
      resolve();
    };

    transaction.onerror = () => {
      reject(new Error('Failed to initialize demo data'));
    };
  });
}

/**
 * Keep a small assessment history available in the demo account.
 */
async function ensureDemoSurveySamples(studentId: string): Promise<void> {
  const db = await initializeDemoDatabase();
  const [gad7Surveys, phq9Surveys] = await Promise.all([
    getDemoGad7Surveys(studentId),
    getDemoPhq9Surveys(studentId),
  ]);

  if (gad7Surveys.length > 0 && phq9Surveys.length > 0) return;

  const samples = generateDemoSurveySamples(studentId);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.GAD7_SURVEYS, STORES.PHQ9_SURVEYS], 'readwrite');

    if (gad7Surveys.length === 0) {
      const gad7Store = transaction.objectStore(STORES.GAD7_SURVEYS);
      samples.gad7Surveys.forEach((survey) => gad7Store.put(survey));
    }

    if (phq9Surveys.length === 0) {
      const phq9Store = transaction.objectStore(STORES.PHQ9_SURVEYS);
      samples.phq9Surveys.forEach((survey) => phq9Store.put(survey));
    }

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error('Failed to initialize sample survey data'));
  });
}

function generateDemoSurveySamples(studentId: string) {
  const now = Date.now();
  const completedAt = (daysAgo: number) => new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();

  return {
    gad7Surveys: [
      { id: 'demo-gad7-1', studentId, q1Nervous: 1, q2Control: 1, q3Worrying: 1, q4Relaxing: 0, q5Restless: 1, q6Irritable: 0, q7Afraid: 0, totalScore: 4, severity: 'MINIMAL', completedAt: completedAt(14) },
      { id: 'demo-gad7-2', studentId, q1Nervous: 2, q2Control: 1, q3Worrying: 2, q4Relaxing: 1, q5Restless: 1, q6Irritable: 1, q7Afraid: 1, totalScore: 9, severity: 'MILD', completedAt: completedAt(7) },
      { id: 'demo-gad7-3', studentId, q1Nervous: 1, q2Control: 1, q3Worrying: 1, q4Relaxing: 1, q5Restless: 0, q6Irritable: 1, q7Afraid: 1, totalScore: 6, severity: 'MILD', completedAt: completedAt(2) },
    ],
    phq9Surveys: [
      { id: 'demo-phq9-1', studentId, q1LittleInterest: 1, q2Depressed: 0, q3SleepTrouble: 1, q4Tired: 1, q5Appetite: 0, q6BadAboutSelf: 0, q7Concentration: 1, q8Restless: 0, q9SuicideThoughts: 0, totalScore: 4, severity: 'NONE', completedAt: completedAt(14) },
      { id: 'demo-phq9-2', studentId, q1LittleInterest: 1, q2Depressed: 1, q3SleepTrouble: 1, q4Tired: 2, q5Appetite: 1, q6BadAboutSelf: 0, q7Concentration: 1, q8Restless: 0, q9SuicideThoughts: 0, totalScore: 7, severity: 'MILD', completedAt: completedAt(7) },
      { id: 'demo-phq9-3', studentId, q1LittleInterest: 0, q2Depressed: 1, q3SleepTrouble: 1, q4Tired: 1, q5Appetite: 0, q6BadAboutSelf: 0, q7Concentration: 1, q8Restless: 0, q9SuicideThoughts: 0, totalScore: 5, severity: 'MILD', completedAt: completedAt(2) },
    ],
  };
}

/**
 * Generate 3 days of mood check-in data
 */
function generateThreeDaysMoodCheckIns(): DemoMoodCheckIn[] {
  const checkIns: DemoMoodCheckIn[] = [];
  const today = new Date();

  const moodTexts = [
    'Feeling good today! 😊 Had a productive study session.',
    'A bit stressed with assignments, but managing well.',
    'Peaceful morning, did some meditation.',
    'Excited about the upcoming project!',
    'Tired but satisfied with my work.',
    'Anxious about the exam, trying to stay calm.',
    'Happy and energized! 🌟',
    'Feeling overwhelmed, took a break.',
    'Great day with friends!',
    'Reflective mood, learning a lot about myself.',
  ];

  const moods = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const factors = [
    'sleep',
    'exercise',
    'social',
    'study',
    'diet',
    'weather',
    'family',
  ];

  // Generate 8-12 entries per day for 3 days (24-36 total)
  for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
    const dayDate = new Date(today);
    dayDate.setDate(dayDate.getDate() - dayOffset);
    dayDate.setHours(0, 0, 0, 0);

    const entriesPerDay = Math.floor(Math.random() * 5) + 8; // 8-12 entries

    for (let i = 0; i < entriesPerDay; i++) {
      const randomHour = Math.floor(Math.random() * 16) + 6; // 6 AM - 10 PM
      const randomMinute = Math.floor(Math.random() * 60);

      const checkInDate = new Date(dayDate);
      checkInDate.setHours(randomHour, randomMinute);

      const moodLevel = moods[Math.floor(Math.random() * moods.length)];
      const selectedFactors = factors
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 2);

      const moodFactors: Record<string, boolean> = {};
      selectedFactors.forEach((factor) => {
        moodFactors[factor] = Math.random() > 0.3;
      });

      checkIns.push({
        id: `mood-${dayOffset}-${i}`,
        studentId: 'demo-student-123',
        moodLevel,
        moodFactors,
        journal: moodTexts[Math.floor(Math.random() * moodTexts.length)],
        checkInDate: checkInDate.toISOString().split('T')[0],
        createdAt: checkInDate,
      });
    }
  }

  return checkIns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Generate demo notifications
 */
function generateDemoNotifications(): DemoNotification[] {
  return [
    {
      id: 'notif-1',
      studentId: 'demo-student-123',
      title: 'Wellness Tip',
      message: '🧘 Take a mindfulness break. Deep breathing helps reduce stress!',
      type: 'info',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: 'notif-2',
      studentId: 'demo-student-123',
      title: 'Appointment Reminder',
      message: '📅 Your counseling session is tomorrow at 2:00 PM',
      type: 'info',
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: 'notif-3',
      studentId: 'demo-student-123',
      title: '🎉 Achievement Unlocked',
      message: 'You completed 7 days of mood tracking!',
      type: 'success',
      isRead: true,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
    {
      id: 'notif-4',
      studentId: 'demo-student-123',
      title: '⚠️ Check-in Reminder',
      message: 'How are you feeling today? Take a moment to log your mood.',
      type: 'warning',
      isRead: false,
      createdAt: new Date(),
    },
    {
      id: 'notif-5',
      studentId: 'demo-student-123',
      title: '❤️ Community Support',
      message: 'Someone commented on your community post!',
      type: 'info',
      isRead: false,
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
    },
  ];
}

/**
 * Read demo notifications from IndexedDB.
 */
export async function getDemoNotifications(studentId: string = 'demo-student-123'): Promise<DemoNotification[]> {
  const db = await initializeDemoDatabase();
  await initializeDemoData(studentId);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.NOTIFICATIONS], 'readonly');
    const request = transaction.objectStore(STORES.NOTIFICATIONS).getAll();

    request.onsuccess = () => {
      const notifications = (request.result as DemoNotification[])
        .filter((notification) => notification.studentId === studentId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      resolve(notifications);
    };
    request.onerror = () => reject(new Error('Failed to fetch demo notifications'));
  });
}

/**
 * Mark one or all demo notifications as read locally.
 */
export async function markDemoNotificationsAsRead(notificationId?: string): Promise<void> {
  const db = await initializeDemoDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.NOTIFICATIONS], 'readwrite');
    const store = transaction.objectStore(STORES.NOTIFICATIONS);
    const request = notificationId ? store.get(notificationId) : store.getAll();

    request.onsuccess = () => {
      const notifications = notificationId ? [request.result] : request.result;
      notifications.filter(Boolean).forEach((notification: DemoNotification) => {
        store.put({ ...notification, isRead: true });
      });
    };
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error('Failed to update demo notifications'));
  });
}

/**
 * Generate demo counseling sessions
 */
function generateDemoSessions(): DemoSession[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    {
      id: 'session-1',
      studentId: 'demo-student-123',
      title: 'Initial Consultation',
      facilitator: 'Dr. Sarah Johnson',
      scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      duration: 50,
      status: 'completed',
    },
    {
      id: 'session-2',
      studentId: 'demo-student-123',
      title: 'Stress Management Techniques',
      facilitator: 'Prof. Michael Chen',
      scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      duration: 45,
      status: 'completed',
    },
    {
      id: 'session-3',
      studentId: 'demo-student-123',
      title: 'Academic Planning Session',
      facilitator: 'Dr. Sarah Johnson',
      scheduledAt: tomorrow,
      duration: 50,
      status: 'scheduled',
    },
    {
      id: 'session-4',
      studentId: 'demo-student-123',
      title: 'Follow-up Consultation',
      facilitator: 'Prof. Michael Chen',
      scheduledAt: nextWeek,
      duration: 45,
      status: 'scheduled',
    },
  ];
}

/**
 * Generate fake community posts for demo
 */
function generateDemoCommunityPosts(): any[] {
  return [
    {
      id: 'post-1',
      studentId: 'student-001',
      author: 'Alex Kumar',
      avatar: '👨‍🎓',
      title: 'Tips for Managing Exam Stress',
      content:
        'I found that breaking down my study material into smaller chunks really helps! Also, taking regular breaks keeps me energized.',
      category: 'Study Tips',
      likes: 24,
      comments: 5,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isLiked: false,
    },
    {
      id: 'post-2',
      studentId: 'student-002',
      author: 'Priya Sharma',
      avatar: '👩‍🎓',
      title: 'Started Journaling and It Changed My Life!',
      content:
        'Journaling has been such a therapeutic way to process my emotions. Highly recommend trying it out for anyone struggling with anxiety.',
      category: 'Mental Wellness',
      likes: 42,
      comments: 12,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isLiked: true,
    },
    {
      id: 'post-3',
      studentId: 'student-003',
      author: 'Rohan Patel',
      avatar: '👨‍💼',
      title: 'Finding Balance Between Academics and Social Life',
      content:
        "It's important to prioritize your mental health. I learned that saying 'no' sometimes is okay and necessary for your wellbeing.",
      category: 'Life Balance',
      likes: 18,
      comments: 8,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      isLiked: false,
    },
    {
      id: 'post-4',
      studentId: 'student-004',
      author: 'Anjali Singh',
      avatar: '👩‍🎨',
      title: 'Creative Outlets for Mental Wellness',
      content:
        'Drawing and painting have become my escape. Art is a wonderful way to express feelings that are hard to put into words.',
      category: 'Wellness',
      likes: 31,
      comments: 7,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      isLiked: false,
    },
    {
      id: 'post-5',
      studentId: 'student-005',
      author: 'Vikram Desai',
      avatar: '👨‍🏃',
      title: 'Fitness Routine That Actually Helps My Mood',
      content:
        'Started going to the gym and it has drastically improved my mood and confidence. Physical activity is underrated for mental health!',
      category: 'Fitness',
      likes: 37,
      comments: 11,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isLiked: true,
    },
  ];
}

/**
 * Check if demo data already exists
 */
async function checkIfDemoDataExists(): Promise<boolean> {
  const db = await initializeDemoDatabase();

  return new Promise((resolve) => {
    const transaction = db.transaction([STORES.MOOD_CHECKINS], 'readonly');
    const store = transaction.objectStore(STORES.MOOD_CHECKINS);
    const request = store.count();

    request.onsuccess = () => {
      resolve(request.result > 0);
    };

    request.onerror = () => {
      resolve(false);
    };
  });
}

/**
 * Get all mood check-ins for demo student
 */
export async function getDemoMoodCheckIns(days: number = 3): Promise<DemoMoodCheckIn[]> {
  const db = await initializeDemoDatabase();
  await initializeDemoData();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MOOD_CHECKINS], 'readonly');
    const store = transaction.objectStore(STORES.MOOD_CHECKINS);
    const request = store.getAll();

    request.onsuccess = (event) => {
      const allCheckIns = (event.target as IDBRequest).result as DemoMoodCheckIn[];

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const filtered = allCheckIns.filter(
        (item) => new Date(item.checkInDate) >= cutoffDate
      );

      resolve(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };

    request.onerror = () => {
      reject(new Error('Failed to get mood check-ins'));
    };
  });
}

/**
 * Add a new mood check-in for the demo student
 */
export async function addDemoMoodCheckIn(checkInData: any): Promise<void> {
  const db = await initializeDemoDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MOOD_CHECKINS], 'readwrite');
    const store = transaction.objectStore(STORES.MOOD_CHECKINS);

    const now = new Date();
    
    // Map mood score to label
    const moodLabels = ['Terrible', 'Bad', 'Okay', 'Neutral', 'Good', 'Great', 'Amazing'];
    const labelIdx = Math.max(0, Math.min(6, checkInData.moodLevel - 1));

    const newCheckIn = {
      id: `mood-today-${Date.now()}`,
      studentId: checkInData.studentId || 'demo-student-123',
      moodLevel: checkInData.moodLevel,
      moodLabel: moodLabels[labelIdx],
      moodFactors: checkInData.moodFactors || {},
      journal: checkInData.journal || null,
      checkInDate: now.toISOString().split('T')[0],
      createdAt: now,
    };

    const request = store.add(newCheckIn);

    request.onsuccess = () => {
      console.log('✅ Demo mood check-in added successfully');
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to add demo mood check-in'));
    };
  });
}

/**
 * Check if demo user has a mood check-in for today
 */
export async function getTodayDemoMoodCheckIn(studentId: string = 'demo-student-123'): Promise<any | null> {
  const checkIns = await getDemoMoodCheckIns(1); // Get last 1 day
  const todayDateStr = new Date().toISOString().split('T')[0];
  
  const todayCheckIn = checkIns.find(c => c.checkInDate === todayDateStr && c.studentId === studentId);
  
  if (todayCheckIn) {
    // Transform to match API format expected by components
    return {
      id: todayCheckIn.id,
      moodScore: todayCheckIn.moodLevel,
      moodLabel: todayCheckIn.moodLabel || 'Neutral',
      factors: todayCheckIn.moodFactors || {},
      notes: todayCheckIn.journal,
      checkInDate: todayCheckIn.checkInDate,
      createdAt: todayCheckIn.createdAt
    };
  }
  
  return null;
}

/**
 * Get community posts
 */
export async function getCommunityposts(): Promise<any[]> {
  const db = await initializeDemoDatabase();
  await initializeDemoData();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.COMMUNITY_POSTS], 'readonly');
    const store = transaction.objectStore(STORES.COMMUNITY_POSTS);
    const request = store.getAll();

    request.onsuccess = (event) => {
      const posts = (event.target as IDBRequest).result;
      resolve(posts.reverse());
    };

    request.onerror = () => {
      reject(new Error('Failed to get community posts'));
    };
  });
}

/**
 * Add new community post (demo)
 */
export async function addCommunityPost(post: any): Promise<void> {
  const db = await initializeDemoDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.COMMUNITY_POSTS], 'readwrite');
    const store = transaction.objectStore(STORES.COMMUNITY_POSTS);

    const newPost = {
      ...post,
      id: `post-${Date.now()}`,
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      isLiked: false,
    };

    const request = store.add(newPost);

    request.onsuccess = () => {
      console.log('✅ Community post added');
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to add post'));
    };
  });
}

/**
 * Save GAD-7 survey to IndexedDB
 */
export async function saveDemoGad7Survey(surveyData: any): Promise<void> {
  const db = await initializeDemoDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.GAD7_SURVEYS], 'readwrite');
    const store = transaction.objectStore(STORES.GAD7_SURVEYS);

    const survey = {
      id: `gad7-${Date.now()}`,
      studentId: surveyData.studentId || 'demo-student-123',
      q1Nervous: surveyData.q1_nervous,
      q2Control: surveyData.q2_control,
      q3Worrying: surveyData.q3_worrying,
      q4Relaxing: surveyData.q4_relaxing,
      q5Restless: surveyData.q5_restless,
      q6Irritable: surveyData.q6_irritable,
      q7Afraid: surveyData.q7_afraid,
      totalScore: surveyData.totalScore,
      severity: surveyData.severity,
      completedAt: new Date().toISOString(),
    };

    const request = store.add(survey);

    request.onsuccess = () => {
      console.log('✅ GAD-7 survey saved');
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to save GAD-7 survey'));
    };
  });
}

/**
 * Get GAD-7 surveys from IndexedDB
 */
export async function getDemoGad7Surveys(studentId: string = 'demo-student-123'): Promise<any[]> {
  const db = await initializeDemoDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.GAD7_SURVEYS], 'readonly');
    const store = transaction.objectStore(STORES.GAD7_SURVEYS);
    const request = store.getAll();

    request.onsuccess = () => {
      const surveys = (request.result as any[]).filter(
        (s) => s.studentId === studentId
      );
      resolve(surveys);
    };

    request.onerror = () => {
      reject(new Error('Failed to fetch GAD-7 surveys'));
    };
  });
}

/**
 * Save PHQ-9 survey to IndexedDB
 */
export async function saveDemoPhq9Survey(surveyData: any): Promise<void> {
  const db = await initializeDemoDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PHQ9_SURVEYS], 'readwrite');
    const store = transaction.objectStore(STORES.PHQ9_SURVEYS);

    const survey = {
      id: `phq9-${Date.now()}`,
      studentId: surveyData.studentId || 'demo-student-123',
      q1LittleInterest: surveyData.q1_little_interest,
      q2Depressed: surveyData.q2_depressed,
      q3SleepTrouble: surveyData.q3_sleep_trouble,
      q4Tired: surveyData.q4_tired,
      q5Appetite: surveyData.q5_appetite,
      q6BadAboutSelf: surveyData.q6_bad_about_self,
      q7Concentration: surveyData.q7_concentration,
      q8Restless: surveyData.q8_restless,
      q9SuicideThoughts: surveyData.q9_suicide_thoughts,
      totalScore: surveyData.totalScore,
      severity: surveyData.severity,
      completedAt: new Date().toISOString(),
    };

    const request = store.add(survey);

    request.onsuccess = () => {
      console.log('✅ PHQ-9 survey saved');
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to save PHQ-9 survey'));
    };
  });
}

/**
 * Get PHQ-9 surveys from IndexedDB
 */
export async function getDemoPhq9Surveys(studentId: string = 'demo-student-123'): Promise<any[]> {
  const db = await initializeDemoDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PHQ9_SURVEYS], 'readonly');
    const store = transaction.objectStore(STORES.PHQ9_SURVEYS);
    const request = store.getAll();

    request.onsuccess = () => {
      const surveys = (request.result as any[]).filter(
        (s) => s.studentId === studentId
      );
      resolve(surveys);
    };

    request.onerror = () => {
      reject(new Error('Failed to fetch PHQ-9 surveys'));
    };
  });
}
