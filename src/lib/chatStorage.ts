// IndexedDB utilities for chat history storage
interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'suggestion' | 'warning' | 'resource';
}

interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

class ChatStorage {
  private dbName = 'SoulwiseChatDB';
  private version = 1;
  private storeName = 'chatSessions';
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store for chat sessions
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
    });
  }

  async saveMessages(sessionId: string, messages: ChatMessage[]): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const session: ChatSession = {
        id: sessionId,
        messages: messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp) // Ensure timestamp is Date object
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const request = store.put(session);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to save messages:', request.error);
        reject(request.error);
      };
    });
  }

  async loadMessages(sessionId: string): Promise<ChatMessage[]> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(sessionId);

      request.onsuccess = () => {
        if (request.result) {
          const session: ChatSession = request.result;
          // Convert timestamp strings back to Date objects if needed
          const messages = session.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          resolve(messages);
        } else {
          resolve([]);
        }
      };

      request.onerror = () => {
        console.error('Failed to load messages:', request.error);
        reject(request.error);
      };
    });
  }

  async getAllSessions(): Promise<ChatSession[]> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Failed to get all sessions:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(sessionId);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to delete session:', request.error);
        reject(request.error);
      };
    });
  }

  async clearAllSessions(): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to clear all sessions:', request.error);
        reject(request.error);
      };
    });
  }

  // Get current session ID from localStorage or create new one
  getCurrentSessionId(): string {
    const stored = localStorage.getItem('soulwise_chat_session_id');
    if (stored) {
      return stored;
    }
    
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    localStorage.setItem('soulwise_chat_session_id', newSessionId);
    return newSessionId;
  }

  // Create new session
  createNewSession(): string {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    localStorage.setItem('soulwise_chat_session_id', newSessionId);
    return newSessionId;
  }
}

// Export singleton instance
export const chatStorage = new ChatStorage();

// Export types
export type { ChatMessage, ChatSession };