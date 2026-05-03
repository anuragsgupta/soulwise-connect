/**
 * In-memory mock data storage for demo student
 * Used server-side in API routes (IndexedDB can only be used client-side)
 */

export interface DemoMoodCheckIn {
  id: string;
  studentId: string;
  moodLevel: number;
  moodFactors: Record<string, boolean>;
  journal: string;
  checkInDate: string;
  createdAt: Date;
}

export interface DemoNotification {
  id: string;
  studentId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: Date;
}

export interface DemoSession {
  id: string;
  studentId: string;
  title: string;
  facilitator: string;
  scheduledAt: Date;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

// In-memory storage for demo data
const demoDataStore = {
  moodCheckIns: new Map<string, DemoMoodCheckIn[]>(),
  notifications: new Map<string, DemoNotification[]>(),
  sessions: new Map<string, DemoSession[]>(),
};

/**
 * Initialize demo data for a student
 */
export function initializeDemoData(studentId: string): void {
  if (demoDataStore.moodCheckIns.has(studentId)) {
    return; // Already initialized
  }

  console.log('✅ Initializing demo data for:', studentId);

  // Generate sample mood check-ins
  const today = new Date();
  const moodCheckIns: DemoMoodCheckIn[] = [];

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

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

    moodCheckIns.push({
      id: `mood-${studentId}-${dateStr}`,
      studentId,
      moodLevel: moodLevels[Math.floor(Math.random() * moodLevels.length)],
      moodFactors,
      journal: journals[Math.floor(Math.random() * journals.length)],
      checkInDate: dateStr,
      createdAt: new Date(dateStr),
    });
  }

  demoDataStore.moodCheckIns.set(studentId, moodCheckIns);

  // Generate sample notifications
  const notifications: DemoNotification[] = [
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
      message: "Don't forget to complete your daily mood check-in!",
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

  demoDataStore.notifications.set(studentId, notifications);

  // Generate sample sessions
  const sessions: DemoSession[] = [
    {
      id: 'session-1',
      studentId,
      title: 'General Counseling',
      facilitator: 'Dr. Priya Sharma',
      scheduledAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      duration: 60,
      status: 'completed',
    },
    {
      id: 'session-2',
      studentId,
      title: 'Stress Management',
      facilitator: 'Ms. Rajini Kumar',
      scheduledAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
      duration: 45,
      status: 'completed',
    },
    {
      id: 'session-3',
      studentId,
      title: 'Career Counseling',
      facilitator: 'Dr. Amit Patel',
      scheduledAt: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
      duration: 60,
      status: 'scheduled',
    },
    {
      id: 'session-4',
      studentId,
      title: 'Academic Support',
      facilitator: 'Dr. Priya Sharma',
      scheduledAt: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
      duration: 45,
      status: 'scheduled',
    },
  ];

  demoDataStore.sessions.set(studentId, sessions);
  console.log('✅ Demo data initialized');
}

/**
 * Get mood check-ins for demo student
 */
export function getDemoMoodCheckInsServer(studentId: string, days: number = 7): DemoMoodCheckIn[] {
  initializeDemoData(studentId);
  const allCheckIns = demoDataStore.moodCheckIns.get(studentId) || [];

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  return allCheckIns.filter((item) => item.checkInDate >= startDateStr);
}

/**
 * Add mood check-in for demo student
 */
export function addDemoMoodCheckInServer(checkIn: DemoMoodCheckIn): DemoMoodCheckIn {
  initializeDemoData(checkIn.studentId);
  const checkIns = demoDataStore.moodCheckIns.get(checkIn.studentId) || [];

  // Check if check-in for today already exists
  const today = new Date().toISOString().split('T')[0];
  const existingIndex = checkIns.findIndex(
    (c) => c.checkInDate === today && c.studentId === checkIn.studentId
  );

  if (existingIndex >= 0) {
    checkIns[existingIndex] = checkIn;
  } else {
    checkIns.push(checkIn);
  }

  demoDataStore.moodCheckIns.set(checkIn.studentId, checkIns);
  return checkIn;
}

/**
 * Get notifications for demo student
 */
export function getDemoNotificationsServer(studentId: string): DemoNotification[] {
  initializeDemoData(studentId);
  return demoDataStore.notifications.get(studentId) || [];
}

/**
 * Get sessions for demo student
 */
export function getDemoSessionsServer(studentId: string): DemoSession[] {
  initializeDemoData(studentId);
  return demoDataStore.sessions.get(studentId) || [];
}
