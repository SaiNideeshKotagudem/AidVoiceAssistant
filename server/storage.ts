import { users, emergencyProtocols, emergencyContacts, userSessions, type User, type InsertUser, type EmergencyProtocol, type InsertEmergencyProtocol, type EmergencyContact, type InsertEmergencyContact, type UserSession, type InsertUserSession } from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Emergency protocols
  getEmergencyProtocols(): Promise<EmergencyProtocol[]>;
  getEmergencyProtocolByType(type: string): Promise<EmergencyProtocol | undefined>;
  createEmergencyProtocol(protocol: InsertEmergencyProtocol): Promise<EmergencyProtocol>;
  updateEmergencyProtocol(id: number, protocol: Partial<InsertEmergencyProtocol>): Promise<EmergencyProtocol | undefined>;

  // Emergency contacts
  getEmergencyContacts(country?: string): Promise<EmergencyContact[]>;
  getEmergencyContactsByType(type: string, country?: string): Promise<EmergencyContact[]>;
  createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact>;
  updateEmergencyContact(id: number, contact: Partial<InsertEmergencyContact>): Promise<EmergencyContact | undefined>;

  // User sessions
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  getUserSessions(userId: number): Promise<UserSession[]>;
  updateUserSession(id: number, session: Partial<InsertUserSession>): Promise<UserSession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private emergencyProtocols: Map<number, EmergencyProtocol>;
  private emergencyContacts: Map<number, EmergencyContact>;
  private userSessions: Map<number, UserSession>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.emergencyProtocols = new Map();
    this.emergencyContacts = new Map();
    this.userSessions = new Map();
    this.currentId = 1;
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default emergency protocols
    const defaultProtocols = [
      {
        id: this.currentId++,
        type: "fire",
        name: "Fire Emergency",
        description: "Protocol for fire emergencies",
        instructions: {
          steps: [
            "Stay low and exit immediately",
            "Call emergency services",
            "Go to meeting point"
          ]
        },
        severity: "high",
        category: "structural",
        languages: {
          en: "Fire Emergency",
          es: "Emergencia de Incendio",
          fr: "Urgence Incendie",
          hi: "आग की आपातकाल",
          ar: "حالة طوارئ حريق"
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        type: "medical",
        name: "Medical Emergency",
        description: "Protocol for medical emergencies",
        instructions: {
          steps: [
            "Check for responsiveness",
            "Call emergency services immediately",
            "Begin first aid if trained"
          ]
        },
        severity: "critical",
        category: "medical",
        languages: {
          en: "Medical Emergency",
          es: "Emergencia Médica",
          fr: "Urgence Médicale",
          hi: "चिकित्सा आपातकाल",
          ar: "حالة طوارئ طبية"
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        type: "earthquake",
        name: "Earthquake",
        description: "Protocol for earthquake emergencies",
        instructions: {
          steps: [
            "Drop, cover, and hold on",
            "Stay away from windows and heavy objects",
            "Exit building when shaking stops"
          ]
        },
        severity: "high",
        category: "natural",
        languages: {
          en: "Earthquake",
          es: "Terremoto",
          fr: "Tremblement de terre",
          hi: "भूकंप",
          ar: "زلزال"
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        type: "flood",
        name: "Flood Warning",
        description: "Protocol for flood emergencies",
        instructions: {
          steps: [
            "Move to higher ground immediately",
            "Avoid walking in moving water",
            "Call emergency services"
          ]
        },
        severity: "medium",
        category: "natural",
        languages: {
          en: "Flood Warning",
          es: "Alerta de Inundación",
          fr: "Alerte d'Inondation",
          hi: "बाढ़ की चेतावनी",
          ar: "تحذير من الفيضانات"
        },
        createdAt: new Date(),
      }
    ];

    defaultProtocols.forEach(protocol => {
      this.emergencyProtocols.set(protocol.id, protocol);
    });

    // Initialize default emergency contacts
    const defaultContacts = [
      {
        id: this.currentId++,
        name: "Emergency Services",
        phoneNumber: "911",
        type: "general",
        country: "US",
        region: "national",
        isActive: true,
      },
      {
        id: this.currentId++,
        name: "Fire Department",
        phoneNumber: "911",
        type: "fire",
        country: "US",
        region: "national",
        isActive: true,
      },
      {
        id: this.currentId++,
        name: "Medical Emergency",
        phoneNumber: "911",
        type: "medical",
        country: "US",
        region: "national",
        isActive: true,
      },
      {
        id: this.currentId++,
        name: "Police",
        phoneNumber: "911",
        type: "police",
        country: "US",
        region: "national",
        isActive: true,
      }
    ];

    defaultContacts.forEach(contact => {
      this.emergencyContacts.set(contact.id, contact);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      preferredLanguage: insertUser.preferredLanguage || "en",
      accessibilitySettings: insertUser.accessibilitySettings || {},
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser: User = { ...existingUser, ...updateUser };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getEmergencyProtocols(): Promise<EmergencyProtocol[]> {
    return Array.from(this.emergencyProtocols.values());
  }

  async getEmergencyProtocolByType(type: string): Promise<EmergencyProtocol | undefined> {
    return Array.from(this.emergencyProtocols.values()).find(protocol => protocol.type === type);
  }

  async createEmergencyProtocol(insertProtocol: InsertEmergencyProtocol): Promise<EmergencyProtocol> {
    const id = this.currentId++;
    const protocol: EmergencyProtocol = {
      ...insertProtocol,
      id,
      createdAt: new Date(),
    };
    this.emergencyProtocols.set(id, protocol);
    return protocol;
  }

  async updateEmergencyProtocol(id: number, updateProtocol: Partial<InsertEmergencyProtocol>): Promise<EmergencyProtocol | undefined> {
    const existingProtocol = this.emergencyProtocols.get(id);
    if (!existingProtocol) return undefined;

    const updatedProtocol: EmergencyProtocol = { ...existingProtocol, ...updateProtocol };
    this.emergencyProtocols.set(id, updatedProtocol);
    return updatedProtocol;
  }

  async getEmergencyContacts(country?: string): Promise<EmergencyContact[]> {
    const contacts = Array.from(this.emergencyContacts.values());
    return country ? contacts.filter(contact => contact.country === country) : contacts;
  }

  async getEmergencyContactsByType(type: string, country?: string): Promise<EmergencyContact[]> {
    const contacts = Array.from(this.emergencyContacts.values()).filter(contact => contact.type === type);
    return country ? contacts.filter(contact => contact.country === country) : contacts;
  }

  async createEmergencyContact(insertContact: InsertEmergencyContact): Promise<EmergencyContact> {
    const id = this.currentId++;
    const contact: EmergencyContact = {
      ...insertContact,
      id,
    };
    this.emergencyContacts.set(id, contact);
    return contact;
  }

  async updateEmergencyContact(id: number, updateContact: Partial<InsertEmergencyContact>): Promise<EmergencyContact | undefined> {
    const existingContact = this.emergencyContacts.get(id);
    if (!existingContact) return undefined;

    const updatedContact: EmergencyContact = { ...existingContact, ...updateContact };
    this.emergencyContacts.set(id, updatedContact);
    return updatedContact;
  }

  async createUserSession(insertSession: InsertUserSession): Promise<UserSession> {
    const id = this.currentId++;
    const session: UserSession = {
      ...insertSession,
      id,
      startTime: new Date(),
      endTime: null,
      actions: insertSession.actions || [],
    };
    this.userSessions.set(id, session);
    return session;
  }

  async getUserSessions(userId: number): Promise<UserSession[]> {
    return Array.from(this.userSessions.values()).filter(session => session.userId === userId);
  }

  async updateUserSession(id: number, updateSession: Partial<InsertUserSession>): Promise<UserSession | undefined> {
    const existingSession = this.userSessions.get(id);
    if (!existingSession) return undefined;

    const updatedSession: UserSession = { ...existingSession, ...updateSession };
    this.userSessions.set(id, updatedSession);
    return updatedSession;
  }
}

export const storage = new MemStorage();
