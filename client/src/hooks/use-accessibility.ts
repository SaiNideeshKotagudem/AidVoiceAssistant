import { useState, useCallback, useEffect } from 'react';
import { AccessibilitySettings } from '@/types/accessibility';
import { useToast } from '@/hooks/use-toast';

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  screenReader: false,
  visualAlerts: false,
  vibrationAlerts: false,
  audioDescriptions: false,
  reducedMotion: false,
  keyboardNavigation: false,
};

export const useAccessibility = () => {
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);
  const { toast } = useToast();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setAccessibilitySettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Error parsing accessibility settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(accessibilitySettings));
  }, [accessibilitySettings]);

  // Apply system-level accessibility settings
  useEffect(() => {
    // Check for system reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setAccessibilitySettings(prev => ({ ...prev, reducedMotion: true }));
    }

    // Listen for changes in system preferences
    const handleChange = (e: MediaQueryListEvent) => {
      setAccessibilitySettings(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: boolean) => {
    setAccessibilitySettings(prev => ({ ...prev, [key]: value }));
    
    // Provide feedback for the change
    const settingNames = {
      highContrast: 'High Contrast Mode',
      largeText: 'Large Text',
      screenReader: 'Screen Reader',
      visualAlerts: 'Visual Alerts',
      vibrationAlerts: 'Vibration Alerts',
      audioDescriptions: 'Audio Descriptions',
      reducedMotion: 'Reduced Motion',
      keyboardNavigation: 'Keyboard Navigation',
    };

    toast({
      title: `${settingNames[key]} ${value ? 'Enabled' : 'Disabled'}`,
      description: `Accessibility setting has been updated`,
    });
  }, [toast]);

  const toggleSetting = useCallback((key: keyof AccessibilitySettings) => {
    setAccessibilitySettings(prev => {
      const newValue = !prev[key];
      updateSetting(key, newValue);
      return { ...prev, [key]: newValue };
    });
  }, [updateSetting]);

  const enableScreenReader = useCallback(() => {
    setIsScreenReaderActive(true);
    updateSetting('screenReader', true);
    
    // Announce screen reader activation
    announceToScreenReader('Screen reader activated. AidVoice emergency assistant is ready to help.');
  }, [updateSetting]);

  const disableScreenReader = useCallback(() => {
    setIsScreenReaderActive(false);
    updateSetting('screenReader', false);
  }, [updateSetting]);

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' | 'off' = 'polite') => {
    if (!accessibilitySettings.screenReader && !isScreenReaderActive) {
      return;
    }

    // Create a live region for screen reader announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    
    document.body.appendChild(liveRegion);
    
    // Add the message
    liveRegion.textContent = message;
    
    // Remove the element after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  }, [accessibilitySettings.screenReader, isScreenReaderActive]);

  const describeElement = useCallback((element: HTMLElement): string => {
    const tag = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    const ariaLabel = element.getAttribute('aria-label');
    const alt = element.getAttribute('alt');
    const title = element.getAttribute('title');
    const text = element.textContent?.trim();

    let description = '';

    if (ariaLabel) {
      description = ariaLabel;
    } else if (alt) {
      description = alt;
    } else if (title) {
      description = title;
    } else if (text) {
      description = text;
    }

    if (role) {
      description = `${role}: ${description}`;
    } else if (tag === 'button') {
      description = `Button: ${description}`;
    } else if (tag === 'input') {
      const type = element.getAttribute('type') || 'text';
      description = `${type} input: ${description}`;
    } else if (tag === 'img') {
      description = `Image: ${description}`;
    }

    return description || 'Unlabeled element';
  }, []);

  const triggerVibration = useCallback((pattern: number | number[] = 200) => {
    if (!accessibilitySettings.vibrationAlerts) {
      return;
    }

    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, [accessibilitySettings.vibrationAlerts]);

  const showVisualAlert = useCallback((message: string, type: 'info' | 'warning' | 'error' = 'info') => {
    if (!accessibilitySettings.visualAlerts) {
      return;
    }

    // Create a visual alert that's more prominent than regular toasts
    const alertElement = document.createElement('div');
    alertElement.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg ${
      type === 'error' ? 'bg-red-500 text-white' :
      type === 'warning' ? 'bg-yellow-500 text-black' :
      'bg-blue-500 text-white'
    }`;
    alertElement.style.fontSize = '1.5rem';
    alertElement.style.fontWeight = 'bold';
    alertElement.textContent = message;
    alertElement.setAttribute('role', 'alert');
    alertElement.setAttribute('aria-live', 'assertive');

    document.body.appendChild(alertElement);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(alertElement)) {
        document.body.removeChild(alertElement);
      }
    }, 5000);
  }, [accessibilitySettings.visualAlerts]);

  const resetSettings = useCallback(() => {
    setAccessibilitySettings(defaultSettings);
    setIsScreenReaderActive(false);
    
    toast({
      title: "Settings Reset",
      description: "All accessibility settings have been reset to defaults",
    });
  }, [toast]);

  return {
    accessibilitySettings,
    isScreenReaderActive,
    updateSetting,
    toggleSetting,
    enableScreenReader,
    disableScreenReader,
    announceToScreenReader,
    describeElement,
    triggerVibration,
    showVisualAlert,
    resetSettings,
  };
};
