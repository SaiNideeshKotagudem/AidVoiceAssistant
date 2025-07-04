import { useState, useEffect, useCallback } from 'react';
import { DeviceStatus, DeviceCapabilities, PerformanceMetrics } from '@/types/device';
import { useToast } from '@/hooks/use-toast';

export const useDeviceStatus = () => {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    batteryLevel: 100,
    isCharging: false,
    isOnline: navigator.onLine,
    memoryUsage: 0,
    memoryLimit: 100,
    currentModel: 'Gemma-3n-4B',
    modelPerformance: 'optimal',
    powerSavingMode: false,
  });

  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    hasCamera: false,
    hasMicrophone: false,
    hasSpeaker: true,
    hasVibration: 'vibrate' in navigator,
    hasGeolocation: 'geolocation' in navigator,
    hasAccelerometer: false,
    supportsTouchscreen: 'ontouchstart' in window,
    supportsKeyboard: true,
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    modelLoadTime: 0,
    inferenceTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    batteryDrain: 0,
    cacheHitRate: 0,
  });

  const { toast } = useToast();

  // Battery API
  useEffect(() => {
    const updateBatteryStatus = (battery: any) => {
      setDeviceStatus(prev => ({
        ...prev,
        batteryLevel: Math.round(battery.level * 100),
        isCharging: battery.charging,
      }));
    };

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        updateBatteryStatus(battery);
        
        battery.addEventListener('chargingchange', () => updateBatteryStatus(battery));
        battery.addEventListener('levelchange', () => updateBatteryStatus(battery));
      });
    }
  }, []);

  // Online/Offline status
  useEffect(() => {
    const handleOnline = () => {
      setDeviceStatus(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setDeviceStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Memory usage (approximation)
  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
        
        setDeviceStatus(prev => ({
          ...prev,
          memoryUsage: usedMB,
          memoryLimit: limitMB,
        }));
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000);

    return () => clearInterval(interval);
  }, []);

  // Device capabilities detection
  useEffect(() => {
    const detectCapabilities = async () => {
      const capabilities: Partial<DeviceCapabilities> = {};

      // Check for camera
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        capabilities.hasCamera = devices.some(device => device.kind === 'videoinput');
        capabilities.hasMicrophone = devices.some(device => device.kind === 'audioinput');
      } catch (error) {
        capabilities.hasCamera = false;
        capabilities.hasMicrophone = false;
      }

      // Check for accelerometer
      if ('DeviceMotionEvent' in window) {
        capabilities.hasAccelerometer = true;
      }

      setDeviceCapabilities(prev => ({ ...prev, ...capabilities }));
    };

    detectCapabilities();
  }, []);

  // Performance monitoring
  useEffect(() => {
    const monitorPerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        setPerformanceMetrics(prev => ({
          ...prev,
          modelLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
        }));
      }
    };

    monitorPerformance();
  }, []);

  const enablePowerSavingMode = useCallback(() => {
    setDeviceStatus(prev => ({ ...prev, powerSavingMode: true, currentModel: 'Gemma-3n-2B' }));
    
    toast({
      title: "Power Saving Mode Enabled",
      description: "Switched to lighter AI model to conserve battery",
    });
  }, [toast]);

  const disablePowerSavingMode = useCallback(() => {
    setDeviceStatus(prev => ({ ...prev, powerSavingMode: false, currentModel: 'Gemma-3n-4B' }));
    
    toast({
      title: "Power Saving Mode Disabled",
      description: "Switched back to full AI model",
    });
  }, [toast]);

  const switchToLightModel = useCallback(() => {
    setDeviceStatus(prev => ({ 
      ...prev, 
      currentModel: 'Gemma-3n-2B',
      modelPerformance: 'good' 
    }));
    
    toast({
      title: "AI Model Switched",
      description: "Now using lighter model for better performance",
    });
  }, [toast]);

  const switchToFullModel = useCallback(() => {
    setDeviceStatus(prev => ({ 
      ...prev, 
      currentModel: 'Gemma-3n-4B',
      modelPerformance: 'optimal' 
    }));
    
    toast({
      title: "AI Model Switched",
      description: "Now using full model for best accuracy",
    });
  }, [toast]);

  const checkBatteryLevel = useCallback(() => {
    const { batteryLevel, isCharging } = deviceStatus;
    
    if (batteryLevel < 20 && !isCharging) {
      toast({
        title: "Low Battery Warning",
        description: "Battery level is low. Consider enabling power saving mode.",
        variant: "destructive",
      });
      return 'low';
    } else if (batteryLevel < 10 && !isCharging) {
      toast({
        title: "Critical Battery Warning",
        description: "Battery level is critically low. Power saving mode recommended.",
        variant: "destructive",
      });
      return 'critical';
    }
    
    return 'normal';
  }, [deviceStatus, toast]);

  const checkMemoryUsage = useCallback(() => {
    const { memoryUsage, memoryLimit } = deviceStatus;
    const usagePercentage = (memoryUsage / memoryLimit) * 100;
    
    if (usagePercentage > 80) {
      toast({
        title: "High Memory Usage",
        description: "Memory usage is high. Consider switching to lighter model.",
        variant: "destructive",
      });
      return 'high';
    } else if (usagePercentage > 90) {
      toast({
        title: "Critical Memory Usage",
        description: "Memory usage is critically high. Switching to lighter model recommended.",
        variant: "destructive",
      });
      return 'critical';
    }
    
    return 'normal';
  }, [deviceStatus, toast]);

  const getDeviceInfo = useCallback(() => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      connection: (navigator as any).connection,
    };
  }, []);

  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        toast({
          title: "Offline Mode Ready",
          description: "App is now available offline",
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        
        toast({
          title: "Offline Mode Failed",
          description: "Could not enable offline functionality",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const updatePerformanceMetrics = useCallback((metrics: Partial<PerformanceMetrics>) => {
    setPerformanceMetrics(prev => ({ ...prev, ...metrics }));
  }, []);

  return {
    deviceStatus,
    deviceCapabilities,
    performanceMetrics,
    enablePowerSavingMode,
    disablePowerSavingMode,
    switchToLightModel,
    switchToFullModel,
    checkBatteryLevel,
    checkMemoryUsage,
    getDeviceInfo,
    registerServiceWorker,
    updatePerformanceMetrics,
  };
};
