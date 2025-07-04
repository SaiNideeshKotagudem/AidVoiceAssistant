export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  visualAlerts: boolean;
  vibrationAlerts: boolean;
  audioDescriptions: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
}

export interface AccessibilityFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'vision' | 'hearing' | 'motor' | 'cognitive';
  icon: string;
}

export interface ScreenReaderContent {
  element: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}
