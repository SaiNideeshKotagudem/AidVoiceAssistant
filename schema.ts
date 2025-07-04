import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  preferredLanguage: text("preferred_language").default("en"),
  accessibilitySettings: jsonb("accessibility_settings").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emergencyProtocols = pgTable("emergency_protocols", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  instructions: jsonb("instructions").notNull(),
  severity: text("severity").notNull(),
  category: text("category").notNull(),
  languages: jsonb("languages").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  type: text("type").notNull(), // fire, medical, police, general
  country: text("country").notNull(),
  region: text("region"),
  isActive: boolean("is_active").default(true),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionData: jsonb("session_data").notNull(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  emergencyType: text("emergency_type"),
  actions: jsonb("actions").default([]),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  preferredLanguage: true,
  accessibilitySettings: true,
});

export const insertEmergencyProtocolSchema = createInsertSchema(emergencyProtocols).pick({
  type: true,
  name: true,
  description: true,
  instructions: true,
  severity: true,
  category: true,
  languages: true,
});

export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).pick({
  name: true,
  phoneNumber: true,
  type: true,
  country: true,
  region: true,
  isActive: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).pick({
  userId: true,
  sessionData: true,
  emergencyType: true,
  actions: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEmergencyProtocol = z.infer<typeof insertEmergencyProtocolSchema>;
export type EmergencyProtocol = typeof emergencyProtocols.$inferSelect;
export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;
