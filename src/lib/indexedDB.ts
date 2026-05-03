/**
 * IndexedDB utility for managing demo student data locally
 */

const DB_NAME = 'SoulwiseConnect';
const DB_VERSION = 1;
const DEMO_STORE = 'demoUsers';
const SESSION_STORE = 'sessions';

interface DemoUser {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  userType: 'STUDENT';
  isDemo: true;
  createdAt: number;
}

interface DemoSession {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
export async function initializeIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('❌ IndexedDB initialization failed');
      reject(new Error('Failed to initialize IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('✅ IndexedDB initialized successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create demo users store
      if (!database.objectStoreNames.contains(DEMO_STORE)) {
        const userStore = database.createObjectStore(DEMO_STORE, { keyPath: 'id' });
        userStore.createIndex('email', 'email', { unique: true });
      }

      // Create sessions store
      if (!database.objectStoreNames.contains(SESSION_STORE)) {
        const sessionStore = database.createObjectStore(SESSION_STORE, { keyPath: 'token' });
        sessionStore.createIndex('userId', 'userId', { unique: false });
      }

      console.log('✅ IndexedDB schema created');
    };
  });
}

/**
 * Create a demo student user in IndexedDB
 */
export async function createDemoUser(userData: Partial<DemoUser>): Promise<DemoUser> {
  const database = await initializeIndexedDB();

  const demoUser: DemoUser = {
    id: userData.id || 'demo-student-123',
    name: userData.name || 'Demo Student',
    email: userData.email || 'demo.student@university.edu',
    rollNumber: userData.rollNumber || 'DEMO2024',
    userType: 'STUDENT',
    isDemo: true,
    createdAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([DEMO_STORE], 'readwrite');
    const store = transaction.objectStore(DEMO_STORE);
    const request = store.put(demoUser);

    request.onerror = () => {
      console.error('❌ Failed to create demo user');
      reject(new Error('Failed to create demo user'));
    };

    request.onsuccess = () => {
      console.log('✅ Demo user created:', demoUser.id);
      resolve(demoUser);
    };
  });
}

/**
 * Get demo user from IndexedDB
 */
export async function getDemoUser(userId: string): Promise<DemoUser | null> {
  const database = await initializeIndexedDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([DEMO_STORE], 'readonly');
    const store = transaction.objectStore(DEMO_STORE);
    const request = store.get(userId);

    request.onerror = () => {
      console.error('❌ Failed to retrieve demo user');
      reject(new Error('Failed to retrieve demo user'));
    };

    request.onsuccess = () => {
      resolve(request.result || null);
    };
  });
}

/**
 * Create a demo session
 */
export async function createDemoSession(
  userId: string,
  expirationDays: number = 7
): Promise<DemoSession> {
  const database = await initializeIndexedDB();

  const token = `demo-token-${userId}-${Date.now()}`;
  const now = Date.now();
  const expiresAt = now + expirationDays * 24 * 60 * 60 * 1000;

  const session: DemoSession = {
    token,
    userId,
    createdAt: now,
    expiresAt,
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SESSION_STORE], 'readwrite');
    const store = transaction.objectStore(SESSION_STORE);
    const request = store.put(session);

    request.onerror = () => {
      console.error('❌ Failed to create demo session');
      reject(new Error('Failed to create demo session'));
    };

    request.onsuccess = () => {
      console.log('✅ Demo session created:', token);
      resolve(session);
    };
  });
}

/**
 * Get demo session
 */
export async function getDemoSession(token: string): Promise<DemoSession | null> {
  const database = await initializeIndexedDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SESSION_STORE], 'readonly');
    const store = transaction.objectStore(SESSION_STORE);
    const request = store.get(token);

    request.onerror = () => {
      console.error('❌ Failed to retrieve demo session');
      reject(new Error('Failed to retrieve demo session'));
    };

    request.onsuccess = () => {
      const session = request.result;

      if (!session) {
        resolve(null);
        return;
      }

      // Check if session is expired
      if (session.expiresAt < Date.now()) {
        // Delete expired session
        deleteDemoSession(token).catch(console.error);
        resolve(null);
      } else {
        resolve(session);
      }
    };
  });
}

/**
 * Delete demo session
 */
export async function deleteDemoSession(token: string): Promise<void> {
  const database = await initializeIndexedDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SESSION_STORE], 'readwrite');
    const store = transaction.objectStore(SESSION_STORE);
    const request = store.delete(token);

    request.onerror = () => {
      console.error('❌ Failed to delete demo session');
      reject(new Error('Failed to delete demo session'));
    };

    request.onsuccess = () => {
      console.log('✅ Demo session deleted:', token);
      resolve();
    };
  });
}

/**
 * Verify demo session and get user data
 */
export async function verifyDemoSession(token: string): Promise<DemoUser | null> {
  try {
    const session = await getDemoSession(token);

    if (!session) {
      return null;
    }

    const user = await getDemoUser(session.userId);
    return user;
  } catch (error) {
    console.error('❌ Error verifying demo session:', error);
    return null;
  }
}

/**
 * Clear all demo data (for testing/reset)
 */
export async function clearDemoData(): Promise<void> {
  const database = await initializeIndexedDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([DEMO_STORE, SESSION_STORE], 'readwrite');

    const userStoreRequest = transaction.objectStore(DEMO_STORE).clear();
    const sessionStoreRequest = transaction.objectStore(SESSION_STORE).clear();

    transaction.onerror = () => {
      console.error('❌ Failed to clear demo data');
      reject(new Error('Failed to clear demo data'));
    };

    transaction.oncomplete = () => {
      console.log('✅ Demo data cleared');
      resolve();
    };
  });
}
