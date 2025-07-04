export class OfflineService {
  private static instance: OfflineService;
  private isInitialized = false;
  private isOnline = navigator.onLine;
  private serviceWorkerSupported = false;
  private dbName = 'EmergencyAppDB';
  private dbVersion = 1;

  private constructor() {
    this.setupOnlineStatusListeners();
  }

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if Service Workers are supported
      this.serviceWorkerSupported = 'serviceWorker' in navigator;
      
      if (this.serviceWorkerSupported) {
        await this.registerServiceWorker();
      } else {
        console.warn('Service Workers not supported in this environment. Offline functionality will be limited.');
      }
      
      // Initialize IndexedDB
      await this.initializeIndexedDB();
      
      this.isInitialized = true;
      console.log('Offline service initialized successfully');
    } catch (error) {
      console.warn('Offline service initialization failed:', error);
      // Don't throw error - allow app to continue without offline features
      this.isInitialized = true;
    }
  }

  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported');
        resolve();
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.warn('IndexedDB initialization failed:', request.error);
        resolve(); // Don't reject, allow app to continue
      };

      request.onsuccess = () => {
        request.result.close();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create emergency_actions store
        if (!db.objectStoreNames.contains('emergency_actions')) {
          const actionsStore = db.createObjectStore('emergency_actions', { keyPath: 'id' });
          actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
          actionsStore.createIndex('type', 'type', { unique: false });
        }

        // Create emergency_sessions store
        if (!db.objectStoreNames.contains('emergency_sessions')) {
          const sessionsStore = db.createObjectStore('emergency_sessions', { keyPath: 'id' });
          sessionsStore.createIndex('startTime', 'startTime', { unique: false });
        }
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  async storeAction(action: any): Promise<void> {
    try {
      if (!('indexedDB' in window)) {
        // Fallback to localStorage
        const actions = this.getActionsFromLocalStorage();
        actions.push(action);
        localStorage.setItem('emergency_actions', JSON.stringify(actions));
        return;
      }

      const db = await this.getDB();
      const transaction = db.transaction(['emergency_actions'], 'readwrite');
      const store = transaction.objectStore('emergency_actions');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.add(action);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      db.close();
    } catch (error) {
      console.warn('Failed to store action in IndexedDB, using localStorage fallback:', error);
      // Fallback to localStorage
      try {
        const actions = this.getActionsFromLocalStorage();
        actions.push(action);
        localStorage.setItem('emergency_actions', JSON.stringify(actions));
      } catch (localStorageError) {
        console.error('Failed to store action in localStorage:', localStorageError);
      }
    }
  }

  async storeSession(session: any): Promise<void> {
    try {
      if (!('indexedDB' in window)) {
        // Fallback to localStorage
        const sessions = this.getSessionsFromLocalStorage();
        sessions.push(session);
        localStorage.setItem('emergency_sessions', JSON.stringify(sessions));
        return;
      }

      const db = await this.getDB();
      const transaction = db.transaction(['emergency_sessions'], 'readwrite');
      const store = transaction.objectStore('emergency_sessions');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put(session); // Use put instead of add to allow updates
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      db.close();
    } catch (error) {
      console.warn('Failed to store session in IndexedDB, using localStorage fallback:', error);
      // Fallback to localStorage
      try {
        const sessions = this.getSessionsFromLocalStorage();
        const existingIndex = sessions.findIndex(s => s.id === session.id);
        if (existingIndex >= 0) {
          sessions[existingIndex] = session;
        } else {
          sessions.push(session);
        }
        localStorage.setItem('emergency_sessions', JSON.stringify(sessions));
      } catch (localStorageError) {
        console.error('Failed to store session in localStorage:', localStorageError);
      }
    }
  }

  private getActionsFromLocalStorage(): any[] {
    try {
      const stored = localStorage.getItem('emergency_actions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to parse actions from localStorage:', error);
      return [];
    }
  }

  private getSessionsFromLocalStorage(): any[] {
    try {
      const stored = localStorage.getItem('emergency_sessions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to parse sessions from localStorage:', error);
      return [];
    }
  }

  private async registerServiceWorker(): Promise<void> {
    try {
      if (!this.serviceWorkerSupported) {
        throw new Error('Service Workers are not supported in this environment');
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available
              this.notifyUpdate();
            }
          });
        }
      });
    } catch (error) {
      console.warn('Service Worker registration failed:', error.message);
      // Check if this is the StackBlitz environment
      if (error.message.includes('StackBlitz') || error.message.includes('webcontainer')) {
        console.info('Running in StackBlitz environment - Service Workers not supported yet');
      }
      throw error;
    }
  }

  private setupOnlineStatusListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyOnlineStatusChange(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyOnlineStatusChange(false);
    });
  }

  private notifyUpdate(): void {
    // Dispatch custom event for app to handle
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }

  private notifyOnlineStatusChange(isOnline: boolean): void {
    window.dispatchEvent(new CustomEvent('online-status-change', { 
      detail: { isOnline } 
    }));
  }

  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  isServiceWorkerSupported(): boolean {
    return this.serviceWorkerSupported;
  }

  async cacheEmergencyData(data: any): Promise<void> {
    if (!this.serviceWorkerSupported) {
      // Fallback to localStorage for basic caching
      try {
        localStorage.setItem('emergency-cache', JSON.stringify(data));
      } catch (error) {
        console.warn('Failed to cache emergency data in localStorage:', error);
      }
      return;
    }

    try {
      const cache = await caches.open('emergency-cache-v1');
      const response = new Response(JSON.stringify(data));
      await cache.put('/emergency-data', response);
    } catch (error) {
      console.warn('Failed to cache emergency data:', error);
    }
  }

  async getCachedEmergencyData(): Promise<any> {
    if (!this.serviceWorkerSupported) {
      // Fallback to localStorage
      try {
        const cached = localStorage.getItem('emergency-cache');
        return cached ? JSON.parse(cached) : null;
      } catch (error) {
        console.warn('Failed to retrieve cached emergency data from localStorage:', error);
        return null;
      }
    }

    try {
      const cache = await caches.open('emergency-cache-v1');
      const response = await cache.match('/emergency-data');
      if (response) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Failed to retrieve cached emergency data:', error);
    }
    return null;
  }
}

export const offlineService = OfflineService.getInstance();