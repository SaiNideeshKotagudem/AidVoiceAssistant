# AidVoice - Crisis Response Assistant

## Overview

AidVoice is a comprehensive offline crisis response assistant designed to run fully on mobile and tablet devices. The application provides multimodal interaction through voice, text, and image inputs, offering real-time emergency guidance, translation services, and accessibility features. Built with React, TypeScript, and modern web technologies, it leverages a full-stack architecture with Express.js backend and PostgreSQL database.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: React hooks with TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful APIs with TypeScript validation using Zod schemas

### Progressive Web App (PWA)
- **Service Worker**: Custom implementation for offline functionality
- **Manifest**: Full PWA configuration for mobile installation
- **Caching Strategy**: Static assets and API responses cached locally
- **IndexedDB**: Local storage for emergency protocols and user data

## Key Components

### Multimodal Input System
- **Voice Interface**: Speech recognition with continuous listening
- **Camera Integration**: Image capture for emergency scene analysis
- **Text Input**: Fallback text interface with accessibility support
- **AI Processing**: On-device scene analysis and emergency detection

### Emergency Protocol Engine
- **Protocol Database**: Comprehensive emergency procedures and instructions
- **Dynamic Activation**: Context-aware protocol selection
- **Step-by-Step Guidance**: Progressive instruction delivery
- **Multi-language Support**: Protocols available in 5+ languages

### Accessibility Framework
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Visual Accessibility**: High contrast mode and large text options
- **Motor Accessibility**: Keyboard navigation and voice commands
- **Cognitive Accessibility**: Simplified interfaces and clear instructions

### Translation Services
- **Real-time Translation**: Text and speech translation
- **Emergency Phrases**: Pre-loaded critical phrases in multiple languages
- **Language Detection**: Automatic source language identification
- **Offline Capability**: Local translation models for core languages

### Device Management
- **Battery Optimization**: Power-saving modes and model switching
- **Performance Monitoring**: Real-time device capability assessment
- **Adaptive UI**: Interface adjustments based on device capabilities
- **Model Selection**: Automatic switching between AI model sizes

## Data Flow

1. **User Input**: Voice, text, or image input captured through multimodal interface
2. **Processing**: AI service analyzes input for emergency context and intent
3. **Protocol Selection**: Emergency protocol engine selects appropriate response
4. **Response Generation**: Guidance provided through text-to-speech and visual UI
5. **Translation**: Multi-language support provides localized responses
6. **Persistence**: Session data and actions stored locally and synchronized

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@radix-ui/react-***: Accessible UI component primitives
- **wouter**: Lightweight routing solution

### AI and Media Processing
- **Speech Recognition**: Web Speech API for voice input
- **Speech Synthesis**: Web Speech API for text-to-speech
- **Camera Access**: MediaDevices API for image capture
- **IndexedDB**: Local storage for offline functionality

### Development Tools
- **TypeScript**: Type safety and development experience
- **ESBuild**: Fast server-side bundling
- **Vite**: Frontend build tool with hot module replacement
- **Tailwind CSS**: Utility-first styling framework

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express.js API
- **Database**: PostgreSQL with Drizzle migrations
- **Environment Variables**: DATABASE_URL for database connection

### Production Build
- **Frontend**: Vite build generates optimized static assets
- **Backend**: ESBuild bundles server code for production
- **Database**: Drizzle push for schema deployment
- **Static Assets**: Served from Express.js with proper caching headers

### Offline Capabilities
- **Service Worker**: Caches critical resources and API responses
- **Local Storage**: Emergency protocols and user preferences
- **IndexedDB**: Session data and action history
- **Fallback Modes**: Text-only and basic functionality when resources are limited

## Changelog

```
Changelog:
- July 04, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```