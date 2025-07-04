import { GoogleGenAI } from "@google/genai";

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ConversationContext {
  messages: ConversationMessage[];
  emergencyType?: string;
  userLocation?: { latitude: number; longitude: number };
  deviceStatus?: any;
  language?: string;
}

export class GeminiService {
  private static instance: GeminiService;
  private ai: GoogleGenAI | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('GEMINI_API_KEY not found in environment variables');
        console.log('Available environment variables:', Object.keys(process.env).filter(key => key.includes('GEMINI')));
        throw new Error('GEMINI_API_KEY not found in environment variables. Please set the GEMINI_API_KEY environment variable.');
      }

      this.ai = new GoogleGenAI({ apiKey });
      this.isInitialized = true;
      console.log('Gemini service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini service:', error);
      throw error;
    }
  }

  async chat(message: string, conversationHistory: ConversationMessage[] = [], context?: ConversationContext): Promise<string> {
    if (!this.isInitialized || !this.ai) {
      await this.initialize();
    }

    if (!this.ai) {
      throw new Error('Gemini service not properly initialized');
    }

    try {
      // Build system prompt based on context
      const systemPrompt = this.buildSystemPrompt(context);

      // Create conversation context for the model
      const conversationContext = [
        {
          role: "user",
          parts: [{ text: message }]
        }
      ];

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: message,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      });

      return response.text || "I apologize, but I couldn't process your request right now.";
    } catch (error) {
      console.error('Chat error:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('API key')) {
        throw new Error('Invalid or missing API key. Please check your GEMINI_API_KEY environment variable.');
      } else if (error.message?.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later.');
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw new Error('Failed to generate response');
    }
  }

  async analyzeEmergencyText(text: string): Promise<{
    isEmergency: boolean;
    emergencyType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    recommendations: string[];
  }> {
    if (!this.isInitialized || !this.ai) {
      await this.initialize();
    }

    if (!this.ai) {
      throw new Error('Gemini service not properly initialized');
    }

    try {
      const prompt = `Analyze this text for emergency indicators:
      
      Text: "${text}"
      
      Respond with JSON in this exact format:
      {
        "isEmergency": boolean,
        "emergencyType": "fire|medical|earthquake|flood|tornado|violence|accident|general",
        "severity": "low|medium|high|critical",
        "confidence": number between 0 and 1,
        "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
      }`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              isEmergency: { type: "boolean" },
              emergencyType: { type: "string" },
              severity: { type: "string" },
              confidence: { type: "number" },
              recommendations: { type: "array", items: { type: "string" } }
            },
            required: ["isEmergency", "emergencyType", "severity", "confidence", "recommendations"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      return result;
    } catch (error) {
      console.error('Emergency analysis error:', error);
      return {
        isEmergency: false,
        emergencyType: 'general',
        severity: 'low',
        confidence: 0,
        recommendations: ['Unable to analyze emergency status']
      };
    }
  }

  async translateText(text: string, targetLanguage: string): Promise<{
    translatedText: string;
    sourceLanguage: string;
    confidence: number;
  }> {
    if (!this.isInitialized || !this.ai) {
      await this.initialize();
    }

    if (!this.ai) {
      throw new Error('Gemini service not properly initialized');
    }

    try {
      const prompt = `Translate this text to ${targetLanguage}:
      
      Text: "${text}"
      
      Respond with JSON in this exact format:
      {
        "translatedText": "translated text here",
        "sourceLanguage": "detected source language code",
        "confidence": number between 0 and 1
      }`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              translatedText: { type: "string" },
              sourceLanguage: { type: "string" },
              confidence: { type: "number" }
            },
            required: ["translatedText", "sourceLanguage", "confidence"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      return result;
    } catch (error) {
      console.error('Translation error:', error);
      return {
        translatedText: text,
        sourceLanguage: 'unknown',
        confidence: 0
      };
    }
  }

  async analyzeImage(imageData: string): Promise<{
    description: string;
    emergencyIndicators: string[];
    recommendations: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> {
    if (!this.isInitialized || !this.ai) {
      await this.initialize();
    }

    if (!this.ai) {
      throw new Error('Gemini service not properly initialized');
    }

    try {
      const prompt = `Analyze this image for emergency situations and safety concerns:
      
      Provide a detailed analysis including:
      1. What you see in the image
      2. Any potential emergency indicators
      3. Safety recommendations
      4. Severity level
      
      Respond with JSON in this exact format:
      {
        "description": "detailed description of what you see",
        "emergencyIndicators": ["indicator1", "indicator2"],
        "recommendations": ["recommendation1", "recommendation2"],
        "severity": "low|medium|high|critical"
      }`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: imageData.replace(/^data:image\/[a-z]+;base64,/, ''),
                  mimeType: "image/jpeg"
                }
              },
              { text: prompt }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              description: { type: "string" },
              emergencyIndicators: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } },
              severity: { type: "string" }
            },
            required: ["description", "emergencyIndicators", "recommendations", "severity"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      return result;
    } catch (error) {
      console.error('Image analysis error:', error);
      return {
        description: 'Unable to analyze image',
        emergencyIndicators: [],
        recommendations: ['Unable to analyze image for emergency indicators'],
        severity: 'low'
      };
    }
  }

  private buildSystemPrompt(context?: ConversationContext): string {
    const basePrompt = `You are AidVoice, an AI emergency response assistant. Your role is to:

1. Provide immediate, clear, and actionable emergency guidance
2. Stay calm and professional at all times
3. Prioritize user safety above all else
4. Ask clarifying questions when needed
5. Provide step-by-step instructions for emergency situations
6. Suggest calling emergency services when appropriate
7. Offer emotional support and reassurance

Important guidelines:
- If someone is in immediate danger, prioritize telling them to call emergency services (911 in US)
- Keep responses concise and actionable
- Use simple, clear language
- Avoid medical diagnosis - focus on first aid and safety
- Be empathetic and supportive
- If you're unsure about something, say so and suggest professional help

${context?.emergencyType ? `Current emergency context: ${context.emergencyType}` : ''}
${context?.language ? `Respond in: ${context.language}` : 'Respond in English'}
${context?.userLocation ? `User location available for local emergency services` : ''}`;

    return basePrompt;
  }

  isReady(): boolean {
    return this.isInitialized && this.ai !== null;
  }
}

export const geminiService = GeminiService.getInstance();