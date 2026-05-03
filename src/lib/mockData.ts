/**
 * Mock data and IndexedDB utilities for demo student
 */

export interface MockMoodCheckIn {
  id: string;
  studentId: string;
  moodLevel: number;
  moodFactors: Record<string, boolean>;
  journal: string;
  checkInDate: string;
  createdAt: Date;
}

export interface MockNotification {
  id: string;
  studentId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: Date;
}

export interface MockSession {
  id: string;
  studentId: string;
  title: string;
  facilitator: string;
  scheduledAt: Date;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const DEMO_MOOD_CHECK_INS = 'demoMoodCheckIns';
const DEMO_NOTIFICATIONS = 'demoNotifications';
const DEMO_SESSIONS = 'demoSessions';
const DEMO_DB = 'DemoStudentDB';

let db: IDBDatabase | null = null;

/**
 * Initialize mock data database
 */
export async function initializeMockDataDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DEMO_DB, 1);

    request.onerror = () => {
      console.error('❌ Mock data DB initialization failed');
      reject(new Error('Failed to initialize mock data DB'));
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('✅ Mock data DB initialized');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Mood check-ins store
      if (!database.objectStoreNames.contains(DEMO_MOOD_CHECK_INS)) {
        const moodStore = database.createObjectStore(DEMO_MOOD_CHECK_INS, { keyPath: 'id' });
        moodStore.createIndex('studentId', 'studentId');
        moodStore.createIndex('checkInDate', 'checkInDate');
      }

      // Notifications store
      if (!database.objectStoreNames.contains(DEMO_NOTIFICATIONS)) {
        const notifStore = database.createObjectStore(DEMO_NOTIFICATIONS, { keyPath: 'id' });
        notifStore.createIndex('studentId', 'studentId');
        notifStore.createIndex('isRead', 'isRead');
      }

      // Sessions store
      if (!database.objectStoreNames.contains(DEMO_SESSIONS)) {
        const sessionStore = database.createObjectStore(DEMO_SESSIONS, { keyPath: 'id' });
        sessionStore.createIndex('studentId', 'studentId');
      }

      console.log('✅ Mock data DB schema created');
    };
  });
}

/**
 * Generate sample mood check-ins for demo student
 */
export async function generateSampleMoodCheckIns(studentId: string): Promise<void> {
  const database = await initializeMockDataDB();

  const today = new Date();
  const checkIns: MockMoodCheckIn[] = [];

  // Generate check-ins for the last 30 days
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Skip some days randomly (not everyone checks in every day)
    if (Math.random() > 0.7) continue;

    const moodLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const moodFactors = {
      stress: Math.random() > 0.5,
      sleep: Math.random() > 0.3,
      socialInteraction: Math.random() > 0.4,
      exercise: Math.random() > 0.6,
      healthyEating: Math.random() > 0.5,
      workPressure: Math.random() > 0.4,
    };

    const journals = [
      'Had a good day, feeling positive about my studies.',
      'Feeling stressed with assignments, but managing well.',
      'Great counseling session today, feeling heard.',
      'Busy day, but productive.',
      'Feeling overwhelmed with coursework.',
      'Had a wonderful time with friends, mood improved.',
      'Taking care of myself today with exercise and meditation.',
      'Struggling a bit, but working through it.',
    ];

    checkIns.push({
      id: `mood-${studentId}-${dateStr}`,
      studentId,
      moodLevel: moodLevels[Math.floor(Math.random() * moodLevels.length)],
      moodFactors,
      journal: journals[Math.floor(Math.random() * journals.length)],
      checkInDate: dateStr,
      createdAt: new Date(dateStr),
    });
  }

  // Store in IndexedDB
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([DEMO_MOOD_CHECK_INS], 'readwrite');
    const store = transaction.objectStore(DEMO_MOOD_CHECK_INS);

    checkIns.forEach(checkIn => {
      store.put(checkIn);
    });

    transaction.onerror = () => {
      console.error('❌ Failed to store sample mood check-ins');
      reject(new Error('Failed to store sample mood check-ins'));
    };

    transaction.oncomplete = () => {
      console.log('✅ Sample mood check-ins created:', checkIns.length);
      resolve();
    };
  });
}

/**
 * Generate sample notifications for demo student
 */
export async function generateSampleNotifications(studentId: string): Promise<void> {
  const database = await initializeMockDataDB();

  const notifications: MockNotification[] = [
    {
      id: 'notif-1',
      studentId,
      title: 'Welcome to Mann Mitra!',
      message: 'Welcome to our mental wellness platform. Start your wellness journey today.',
      type: 'success',
      isRead: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'notif-2',
      studentId,
      title: 'Daily Mood Check-in Reminder',
      message: 'Don\'t forget to complete your daily mood check-in!',
      type: 'info',
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: 'notif-3',
      studentId,
      title: 'Wellness Score Update',
      message: 'Your wellness score has improved to 7.5/10! Keep up the good work.',
      type: 'success',
      isRead: false,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
    {
      id: 'notif-4',
      studentId,
      title: 'Counseling Session Scheduled',
      message: 'Your counseling session is scheduled for tomorrow at 2:00 PM.',
      type: 'info',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: 'notif-5',
      studentId,
      title: 'New Resource Available',
      message: 'Check out our new stress management techniques guide.',
      type: 'info',
      isRead: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  ];

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([DEMO_NOTIFICATIONS], 'readwrite');
    const store = transaction.objectStore(DEMO_NOTIFICATIONS);

    notifications.forEach(notif => {
      store.put(notif);
    });

    transaction.onerror = () => {
      console.error('❌ Failed to store sample notifications');
      reject(new Error('Failed to store sample notifications'));
    };

    transaction.oncomplete = () => {
      console.log('✅ Sample notifications created:', notifications.length);
      resolve();
    };
  });
}

/**
 * Generate sample counseling sessions for demo student
 */
export async function generateSampleSessions(studentId: string): Promise<void> {
  const database = await initializeMockDataDB();

  const today = new Date();
  const sessions: MockSession[] = [];

  // Past sessions
  sessions.push({
    id: 'session-1',
    studentId,
    title: 'General Counseling',
    facilitator: 'Dr. Priya Sharma',
    scheduledAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
    duration: 60,
    status: 'completed',
  });

  sessions.push({
    id: 'session-2',
    studentId,
    title: 'Stress Management',
    facilitator: 'Ms. Rajini Kumar',
    scheduledAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
    duration: 45,
    status: 'completed',
  });

  // Upcoming sessions
  sessions.push({
    id: 'session-3',
    studentId,
    title: 'Career Counseling',
    facilitator: 'Dr. Amit Patel',
    scheduledAt: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
    duration: 60,
    status: 'scheduled',
  });

  sessions.push({
    id: 'session-4',
    studentId,
    title: 'Academic Support',
    facilitator: 'Dr. Priya Sharma',
    scheduledAt: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
    duration: 45,
    status: 'scheduled',
  });

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([DEMO_SESSIONS], 'readwrite');
    const store = transaction.objectStore(DEMO_SESSIONS);

    sessions.forEach(session => {
      store.put(session);
    });

    transaction.onerror = () => {
      console.error('❌ Failed to store sample sessions');
      reject(new Error('Failed to store sample sessions'));
    };

    transaction.oncomplete = () => {
      console.log('✅ Sample sessions created:', sessions.length);
      resolve();
    };
  });
}

/**
 * Get mood check-ins for demo student
 */
export async function getDemoMoodCheckIns(
  studentId: string,
  days: number = 7
): Promise<MockMoodCheckIn[]> {
  const database = await initializeMockDataDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([DEMO_MOOD_CHECK_INS], 'readonly');
    const store = transaction.objectStore(DEMO_MOOD_CHECK_INS);
    const index = store.index('studentId');
    const request = index.getAll(studentId);

    request.onerror = () => {
      console.error('❌ Failed to get mood check-ins');
      reject(new Error('Failed to get mood check-ins'));
    };

    request.onsuccess = () => {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const filtered = request.result.filter(
        (item) => item.checkInDate >= startDateStr
      );

      resolve(filtered);
    };
  });
}

/**
 * Get notifications for demo student
 */
export async function getDemoNotifications(studentId: string): Promise<MockNotification[]> {
  const database = await initializeMockDataDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([DEMO_NOTIFICATIONS], 'readonly');
    const store = transaction.objectStore(DEMO_NOTIFICATIONS);
    const index = store.index('studentId');
    const request = index.getAll(studentId);

    request.onerror = () => {
      console.error('❌ Failed to get notifications');
      reject(new Error('Failed to get notifications'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

/**
 * Get sessions for demo student
 */
export async function getDemoSessions(studentId: string): Promise<MockSession[]> {
  const database = await initializeMockDataDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([DEMO_SESSIONS], 'readonly');
    const store = transaction.objectStore(DEMO_SESSIONS);
    const index = store.index('studentId');
    const request = index.getAll(studentId);

    request.onerror = () => {
      console.error('❌ Failed to get sessions');
      reject(new Error('Failed to get sessions'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

/**
 * Add mood check-in for demo student
 */
export async function addDemoMoodCheckIn(
  checkIn: MockMoodCheckIn
): Promise<MockMoodCheckIn> {
  const database = await initializeMockDataDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([DEMO_MOOD_CHECK_INS], 'readwrite');
    const store = transaction.objectStore(DEMO_MOOD_CHECK_INS);
    const request = store.put(checkIn);

    request.onerror = () => {
      console.error('❌ Failed to add mood check-in');
      reject(new Error('Failed to add mood check-in'));
    };

    request.onsuccess = () => {
      console.log('✅ Mood check-in added');
      resolve(checkIn);
    };
  });
}
