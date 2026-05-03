/**
 * Secure API Key Storage in IndexedDB
 * Stores API keys locally without exposing them in environment variables
 */

export interface ApiKeyConfig {
  geminiApiKey?: string;
  lastUpdated?: Date;
}

const DB_NAME = 'SoulwiseConnect';
const DB_VERSION = 1;
const STORE_NAME = 'apiKeys';
const KEY_ID = 'apiKeyConfig';

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB for API key storage
 */
export async function initializeApiKeyDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB not available in server environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };
  });
}

/**
 * Save Gemini API key securely
 */
export async function saveGeminiApiKey(apiKey: string): Promise<void> {
  try {
    const db = await initializeApiKeyDB();

    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const config: ApiKeyConfig = {
      geminiApiKey: apiKey,
      lastUpdated: new Date(),
    };

    return new Promise((resolve, reject) => {
      const request = store.put(config, KEY_ID);

      request.onerror = () => {
        reject(new Error('Failed to save API key'));
      };

      request.onsuccess = () => {
        console.log('✅ Gemini API key saved to IndexedDB');
        resolve();
      };
    });
  } catch (error) {
    console.error('❌ Error saving API key:', error);
    throw error;
  }
}

/**
 * Get Gemini API key from IndexedDB
 */
export async function getGeminiApiKey(): Promise<string | null> {
  try {
    const db = await initializeApiKeyDB();

    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(KEY_ID);

      request.onerror = () => {
        reject(new Error('Failed to retrieve API key'));
      };

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        if (result?.geminiApiKey) {
          console.log('✅ Retrieved Gemini API key from IndexedDB');
          resolve(result.geminiApiKey);
        } else {
          resolve(null);
        }
      };
    });
  } catch (error) {
    console.error('❌ Error retrieving API key:', error);
    return null;
  }
}

/**
 * Delete Gemini API key from IndexedDB
 */
export async function deleteGeminiApiKey(): Promise<void> {
  try {
    const db = await initializeApiKeyDB();

    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(KEY_ID);

      request.onerror = () => {
        reject(new Error('Failed to delete API key'));
      };

      request.onsuccess = () => {
        console.log('✅ Gemini API key deleted from IndexedDB');
        resolve();
      };
    });
  } catch (error) {
    console.error('❌ Error deleting API key:', error);
    throw error;
  }
}

/**
 * Check if API key is stored
 */
export async function hasGeminiApiKey(): Promise<boolean> {
  const key = await getGeminiApiKey();
  return !!key;
}
