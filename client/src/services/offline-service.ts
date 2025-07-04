export class OfflineService {
  private static instance: OfflineService;
  private isInitialized = false;
  private isOnline = navigator.onLine;
  private serviceWorkerSupported = false;

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
      
      this.isInitialized = true;
      console.log('Offline service initialized successfully');
    } catch (error) {
      console.warn('Offline service initialization failed:', error);
      // Don't throw error - allow app to continue without offline features
      this.isInitialized = true;
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