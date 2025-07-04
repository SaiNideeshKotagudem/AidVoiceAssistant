import { EmergencySession, EmergencyAction, EmergencyProtocol } from '@/types/emergency';

export class OfflineService {
  private static instance: OfflineService;
  private dbName = 'AidVoiceDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing Offline Service...');
      
      // Initialize IndexedDB
      await this.initializeDB();
      
      // Register service worker
      await this.registerServiceWorker();
      
      // Preload essential data
      await this.preloadEssentialData();
      
      this.isInitialized = true;
      console.log('Offline Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Offline Service:', error);
      throw error;
    }
  }

  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('startTime', 'startTime');
        }

        if (!db.objectStoreNames.contains('actions')) {
          const actionStore = db.createObjectStore('actions', { keyPath: 'id' });
          actionStore.createIndex('timestamp', 'timestamp');
          actionStore.createIndex('type', 'type');
        }

        if (!db.objectStoreNames.contains('protocols')) {
          const protocolStore = db.createObjectStore('protocols', { keyPath: 'id' });
          protocolStore.createIndex('type', 'type');
          protocolStore.createIndex('category', 'category');
        }

        if (!db.objectStoreNames.contains('translations')) {
          const translationStore = db.createObjectStore('translations', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          translationStore.createIndex('text', 'originalText');
          translationStore.createIndex('language', 'targetLanguage');
        }

        if (!db.objectStoreNames.contains('assets')) {
          const assetStore = db.createObjectStore('assets', { keyPath: 'url' });
          assetStore.createIndex('type', 'type');
        }
      };
    });
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration.scope);
        
        // Listen for service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New content is available; please refresh.');
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private async preloadEssentialData(): Promise<void> {
    try {
      // Preload emergency protocols
      const protocols = await this.getStoredProtocols();
      if (protocols.length === 0) {
        await this.storeDefaultProtocols();
      }

      // Preload essential translations
      await this.preloadTranslations();
      
      console.log('Essential data preloaded');
    } catch (error) {
      console.error('Failed to preload essential data:', error);
    }
  }

  // Session Management
  async storeSession(session: EmergencySession): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      
      const request = store.put(session);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getStoredSessions(): Promise<EmergencySession[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Action Management
  async storeAction(action: EmergencyAction): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      
      const request = store.put(action);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getStoredActions(limit: number = 100): Promise<EmergencyAction[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readonly');
      const store = transaction.objectStore('actions');
      const index = store.index('timestamp');
      
      const request = index.openCursor(null, 'prev');
      const results: EmergencyAction[] = [];
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Protocol Management
  async storeProtocol(protocol: EmergencyProtocol): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['protocols'], 'readwrite');
      const store = transaction.objectStore('protocols');
      
      const request = store.put(protocol);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getStoredProtocols(): Promise<EmergencyProtocol[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['protocols'], 'readonly');
      const store = transaction.objectStore('protocols');
      
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Translation Cache
  async storeTranslation(originalText: string, translatedText: string, targetLanguage: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const translation = {
      originalText,
      translatedText,
      targetLanguage,
      timestamp: new Date(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['translations'], 'readwrite');
      const store = transaction.objectStore('translations');
      
      const request = store.add(translation);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedTranslation(text: string, targetLanguage: string): Promise<string | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['translations'], 'readonly');
      const store = transaction.objectStore('translations');
      const index = store.index('text');
      
      const request = index.get(text);
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.targetLanguage === targetLanguage) {
          resolve(result.translatedText);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Asset Management
  async storeAsset(url: string, blob: Blob, type: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const asset = {
      url,
      blob,
      type,
      timestamp: new Date(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      
      const request = store.put(asset);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getStoredAsset(url: string): Promise<Blob | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assets'], 'readonly');
      const store = transaction.objectStore('assets');
      
      const request = store.get(url);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.blob : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Data Management
  async clearOldData(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const cutoffDate = new Date(Date.now() - maxAge);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sessions', 'actions', 'translations'], 'readwrite');
      
      // Clear old sessions
      const sessionStore = transaction.objectStore('sessions');
      const sessionIndex = sessionStore.index('startTime');
      const sessionRange = IDBKeyRange.upperBound(cutoffDate);
      sessionIndex.openCursor(sessionRange).onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      // Clear old actions
      const actionStore = transaction.objectStore('actions');
      const actionIndex = actionStore.index('timestamp');
      const actionRange = IDBKeyRange.upperBound(cutoffDate);
      actionIndex.openCursor(actionRange).onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
    return { used: 0, quota: 0 };
  }

  // Sync with server when online
  async syncWithServer(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      // Sync sessions
      const sessions = await this.getStoredSessions();
      for (const session of sessions) {
        if (!session.synced) {
          // TODO: Sync session with server
          console.log('Syncing session:', session.id);
        }
      }

      // Sync actions
      const actions = await this.getStoredActions();
      for (const action of actions) {
        if (!action.synced) {
          // TODO: Sync action with server
          console.log('Syncing action:', action.id);
        }
      }
    } catch (error) {
      console.error('Failed to sync with server:', error);
    }
  }

  private async storeDefaultProtocols(): Promise<void> {
    const { getAllEmergencyProtocols } = await import('@/data/emergency-protocols');
    const protocols = getAllEmergencyProtocols();
    
    for (const protocol of protocols) {
      await this.storeProtocol(protocol);
    }
  }

  private async preloadTranslations(): Promise<void> {
    const { emergencyPhrases } = await import('@/data/languages');
    
    // Store common emergency phrases for offline access
    for (const [sourceKey, phrases] of Object.entries(emergencyPhrases)) {
      for (const [phraseKey, phrase] of Object.entries(phrases)) {
        for (const [targetKey, targetPhrases] of Object.entries(emergencyPhrases)) {
          if (sourceKey !== targetKey) {
            const targetPhrase = targetPhrases[phraseKey as keyof typeof targetPhrases];
            if (targetPhrase) {
              await this.storeTranslation(phrase, targetPhrase, targetKey);
            }
          }
        }
      }
    }
  }
}

export const offlineService = OfflineService.getInstance();
