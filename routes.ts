import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertEmergencyProtocolSchema, insertEmergencyContactSchema, insertUserSessionSchema } from "@shared/schema";
import { geminiService, type ConversationMessage, type ConversationContext } from "./gemini-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // Emergency protocol routes
  app.get("/api/emergency-protocols", async (req, res) => {
    try {
      const protocols = await storage.getEmergencyProtocols();
      res.json(protocols);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emergency protocols" });
    }
  });

  app.get("/api/emergency-protocols/:type", async (req, res) => {
    try {
      const type = req.params.type;
      const protocol = await storage.getEmergencyProtocolByType(type);
      if (!protocol) {
        return res.status(404).json({ message: "Emergency protocol not found" });
      }
      res.json(protocol);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emergency protocol" });
    }
  });

  app.post("/api/emergency-protocols", async (req, res) => {
    try {
      const protocolData = insertEmergencyProtocolSchema.parse(req.body);
      const protocol = await storage.createEmergencyProtocol(protocolData);
      res.status(201).json(protocol);
    } catch (error) {
      res.status(400).json({ message: "Invalid protocol data" });
    }
  });

  // Emergency contact routes
  app.get("/api/emergency-contacts", async (req, res) => {
    try {
      const country = req.query.country as string;
      const contacts = await storage.getEmergencyContacts(country);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emergency contacts" });
    }
  });

  app.get("/api/emergency-contacts/type/:type", async (req, res) => {
    try {
      const type = req.params.type;
      const country = req.query.country as string;
      const contacts = await storage.getEmergencyContactsByType(type, country);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emergency contacts by type" });
    }
  });

  app.post("/api/emergency-contacts", async (req, res) => {
    try {
      const contactData = insertEmergencyContactSchema.parse(req.body);
      const contact = await storage.createEmergencyContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      res.status(400).json({ message: "Invalid contact data" });
    }
  });

  // User session routes
  app.post("/api/user-sessions", async (req, res) => {
    try {
      const sessionData = insertUserSessionSchema.parse(req.body);
      const session = await storage.createUserSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  app.get("/api/user-sessions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sessions = await storage.getUserSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user sessions" });
    }
  });

  app.put("/api/user-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sessionData = insertUserSessionSchema.partial().parse(req.body);
      const session = await storage.updateUserSession(id, sessionData);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  // AI service routes
  app.post("/api/ai/analyze-scene", async (req, res) => {
    try {
      const { imageData } = req.body;
      if (!imageData) {
        return res.status(400).json({ message: "Image data is required" });
      }
      
      const analysis = await geminiService.analyzeImage(imageData);
      res.json({ 
        success: true, 
        analysis: analysis.description,
        emergencyType: analysis.emergencyIndicators.length > 0 ? "detected" : "none",
        confidence: analysis.severity === "critical" ? 0.9 : analysis.severity === "high" ? 0.7 : 0.3,
        emergencyIndicators: analysis.emergencyIndicators,
        recommendations: analysis.recommendations,
        severity: analysis.severity
      });
    } catch (error) {
      console.error("Scene analysis error:", error);
      res.status(500).json({ message: "Failed to analyze scene" });
    }
  });

  // Gemini chat routes
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, conversationHistory = [], context } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const response = await geminiService.chat(message, conversationHistory, context);
      res.json({ 
        success: true, 
        response,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to generate response" });
    }
  });

  app.post("/api/gemini/analyze-emergency", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      const analysis = await geminiService.analyzeEmergencyText(text);
      res.json({ 
        success: true, 
        ...analysis
      });
    } catch (error) {
      console.error("Emergency analysis error:", error);
      res.status(500).json({ message: "Failed to analyze emergency text" });
    }
  });

  app.post("/api/gemini/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      
      if (!text || !targetLanguage) {
        return res.status(400).json({ message: "Text and target language are required" });
      }

      const translation = await geminiService.translateText(text, targetLanguage);
      res.json({ 
        success: true, 
        ...translation
      });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ message: "Failed to translate text" });
    }
  });

  app.post("/api/ai/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      // TODO: Implement translation service
      res.json({ 
        success: true, 
        translatedText: `[${targetLanguage}] ${text}`,
        sourceLanguage: "en"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to translate text" });
    }
  });

  app.post("/api/ai/detect-emotion", async (req, res) => {
    try {
      // TODO: Implement emotion detection from voice
      res.json({ 
        success: true, 
        emotion: "neutral",
        stressLevel: 0.0,
        confidence: 0.0
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to detect emotion" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
