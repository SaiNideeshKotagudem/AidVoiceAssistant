export interface EmergencyProtocol {
  id: number;
  type: string;
  name: string;
  description?: string;
  instructions: {
    steps: string[];
    [key: string]: any;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  languages: Record<string, string>;
  createdAt: Date;
}

export interface EmergencyContact {
  id: number;
  name: string;
  phoneNumber: string;
  type: 'fire' | 'medical' | 'police' | 'general';
  country: string;
  region?: string;
  isActive: boolean;
}

export interface EmergencyAction {
  id: string;
  type: 'voice' | 'text' | 'image' | 'call' | 'protocol';
  timestamp: Date;
  data: any;
  success: boolean;
  error?: string;
}

export interface EmergencySession {
  id: number;
  userId?: number;
  sessionData: any;
  startTime: Date;
  endTime?: Date;
  emergencyType?: string;
  actions: EmergencyAction[];
}

export interface SceneAnalysis {
  success: boolean;
  analysis: string;
  emergencyType: string;
  confidence: number;
  objects?: string[];
  hazards?: string[];
  recommendations?: string[];
}

export interface TranslationResult {
  success: boolean;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence?: number;
}

export interface EmotionDetection {
  success: boolean;
  emotion: string;
  stressLevel: number;
  confidence: number;
  recommendations?: string[];
}
