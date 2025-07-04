export interface DeviceStatus {
  batteryLevel: number;
  isCharging: boolean;
  isOnline: boolean;
  memoryUsage: number;
  memoryLimit: number;
  currentModel: string;
  modelPerformance: 'optimal' | 'good' | 'degraded' | 'poor';
  powerSavingMode: boolean;
}

export interface DeviceCapabilities {
  hasCamera: boolean;
  hasMicrophone: boolean;
  hasSpeaker: boolean;
  hasVibration: boolean;
  hasGeolocation: boolean;
  hasAccelerometer: boolean;
  supportsTouchscreen: boolean;
  supportsKeyboard: boolean;
}

export interface PerformanceMetrics {
  modelLoadTime: number;
  inferenceTime: number;
  memoryUsage: number;
  cpuUsage: number;
  batteryDrain: number;
  cacheHitRate: number;
}
