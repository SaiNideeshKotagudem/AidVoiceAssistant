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
  private conversationHistory: ConversationMessage[] = [];

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
      // Get API key from environment
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY not found in environment variables');
      }

      this.ai = new GoogleGenAI({ apiKey });
      this.isInitialized = true;
      console.log('Gemini service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini service:', error);
      throw error;
    }
  }

  async chat(message: string, context?: ConversationContext): Promise<string> {
    if (!this.isInitialized || !this.ai) {
      throw new Error('Gemini service not initialized');
    }

    try {
      // Add user message to conversation history
      const userMessage: ConversationMessage = {
        role: 'user',
        content: message,
        timestamp: Date.now()
      };
      
      this.conversationHistory.push(userMessage);

      // Build system prompt based on context
      const systemPrompt = this.buildSystemPrompt(context);

      // Create conversation context for the model
      const conversationContext = [
        systemPrompt,
        ...this.conversationHistory.slice(-10).map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }))
      ];

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: conversationContext,
        config: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      });

      const responseText = response.text || "I apologize, but I couldn't process your request right now.";

      // Add assistant response to conversation history
      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: responseText,
        timestamp: Date.now()
      };
      
      this.conversationHistory.push(assistantMessage);

      return responseText;
    } catch (error) {
      console.error('Chat error:', error);
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
      throw new Error('Gemini service not initialized');
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
      throw new Error('Gemini service not initialized');
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

  private buildSystemPrompt(context?: ConversationContext): any {
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

    return {
      role: "system",
      parts: [{ text: basePrompt }]
    };
  }

  clearConversationHistory(): void {
    this.conversationHistory = [];
  }

  getConversationHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }

  isReady(): boolean {
    return this.isInitialized && this.ai !== null;
  }
}

export const geminiService = GeminiService.getInstance();