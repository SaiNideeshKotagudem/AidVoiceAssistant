import { SceneAnalysis, EmotionDetection } from '@/types/emergency';
import { apiRequest } from '@/lib/queryClient';

export class AIService {
  private static instance: AIService;
  private isInitialized = false;
  private currentModel = 'Gemma-3n-4B';

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // In a real implementation, this would load TensorFlow.js models
      console.log('Initializing AI service with TensorFlow.js...');
      
      // Simulate model loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isInitialized = true;
      console.log('AI service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      throw error;
    }
  }

  async analyzeScene(imageData: string | Blob): Promise<SceneAnalysis> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Convert image to base64 if it's a Blob
      let imageBase64 = '';
      if (imageData instanceof Blob) {
        imageBase64 = await this.blobToBase64(imageData);
      } else {
        imageBase64 = imageData;
      }

      // In a real implementation, this would use a computer vision model
      // For now, we'll use the server endpoint
      const response = await apiRequest('POST', '/api/ai/analyze-scene', {
        image: imageBase64,
      });

      return await response.json();
    } catch (error) {
      console.error('Scene analysis failed:', error);
      return {
        success: false,
        analysis: 'Scene analysis failed',
        emergencyType: 'unknown',
        confidence: 0,
      };
    }
  }

  async detectEmergencyFromText(text: string): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const lowerText = text.toLowerCase();
    
    // Simple keyword-based detection
    // In a real implementation, this would use NLP models
    const emergencyPatterns = {
      fire: ['fire', 'smoke', 'burning', 'flames', 'burn'],
      medical: ['hurt', 'injured', 'pain', 'bleeding', 'unconscious', 'heart attack', 'stroke', 'seizure'],
      earthquake: ['earthquake', 'shaking', 'tremor', 'quake'],
      flood: ['flood', 'water', 'drowning', 'overflow'],
      tornado: ['tornado', 'twister', 'cyclone'],
      accident: ['accident', 'crash', 'collision', 'wreck'],
      violence: ['violence', 'assault', 'attack', 'robbery', 'threat'],
    };

    for (const [type, keywords] of Object.entries(emergencyPatterns)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return type;
      }
    }

    return 'general';
  }

  async detectEmotion(audioData: ArrayBuffer): Promise<EmotionDetection> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // In a real implementation, this would analyze audio for emotional content
      // For now, we'll use the server endpoint
      const response = await apiRequest('POST', '/api/ai/detect-emotion', {
        audio: Array.from(new Uint8Array(audioData)),
      });

      return await response.json();
    } catch (error) {
      console.error('Emotion detection failed:', error);
      return {
        success: false,
        emotion: 'unknown',
        stressLevel: 0,
        confidence: 0,
      };
    }
  }

  async processVoiceCommand(transcript: string): Promise<{
    intent: string;
    entities: Record<string, string>;
    confidence: number;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const lowerTranscript = transcript.toLowerCase();
    
    // Simple intent detection
    let intent = 'unknown';
    let confidence = 0.5;
    const entities: Record<string, string> = {};

    // Emergency intents
    if (lowerTranscript.includes('help') || lowerTranscript.includes('emergency')) {
      intent = 'emergency_help';
      confidence = 0.9;
    } else if (lowerTranscript.includes('call')) {
      intent = 'emergency_call';
      confidence = 0.8;
      
      // Extract who to call
      if (lowerTranscript.includes('police')) {
        entities.service = 'police';
      } else if (lowerTranscript.includes('fire') || lowerTranscript.includes('ambulance')) {
        entities.service = 'fire';
      } else if (lowerTranscript.includes('medical') || lowerTranscript.includes('doctor')) {
        entities.service = 'medical';
      }
    } else if (lowerTranscript.includes('translate')) {
      intent = 'translate';
      confidence = 0.8;
    } else if (lowerTranscript.includes('guidance') || lowerTranscript.includes('instructions')) {
      intent = 'emergency_guidance';
      confidence = 0.8;
    }

    return { intent, entities, confidence };
  }

  async generateEmergencyInstructions(emergencyType: string, context?: any): Promise<string[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Basic instruction generation
    // In a real implementation, this would use a language model
    const instructions: Record<string, string[]> = {
      fire: [
        'Stay low and exit immediately',
        'Call emergency services (911)',
        'Do not use elevators',
        'Go to designated meeting point',
        'If trapped, signal for help'
      ],
      medical: [
        'Check if person is conscious',
        'Call emergency services (911)',
        'Apply first aid if trained',
        'Keep person warm and comfortable',
        'Monitor breathing and pulse'
      ],
      earthquake: [
        'Drop, cover, and hold on',
        'Stay away from windows',
        'If outdoors, move away from buildings',
        'Wait for shaking to stop',
        'Exit using stairs, not elevators'
      ],
      flood: [
        'Move to higher ground',
        'Avoid walking in flood water',
        'If trapped, go to highest floor',
        'Signal for help',
        'Do not return until safe'
      ],
      tornado: [
        'Go to lowest floor',
        'Stay in interior room',
        'Get under sturdy furniture',
        'Protect head and neck',
        'Stay away from windows'
      ]
    };

    return instructions[emergencyType] || [
      'Stay calm and assess the situation',
      'Call for help if needed',
      'Follow local emergency procedures',
      'Stay safe and wait for assistance'
    ];
  }

  switchModel(modelName: string): void {
    this.currentModel = modelName;
    console.log(`Switched to model: ${modelName}`);
  }

  getCurrentModel(): string {
    return this.currentModel;
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data URL prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const aiService = AIService.getInstance();
