import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Bot, User, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { useAccessibility } from '@/hooks/use-accessibility';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isEmergency?: boolean;
}

interface ChatInterfaceProps {
  emergencyType?: string;
  onEmergencyDetected?: (type: string, severity: string) => void;
  language?: string;
}

export default function ChatInterface({ 
  emergencyType, 
  onEmergencyDetected,
  language = 'en'
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { speak, stop: stopSpeaking } = useSpeechSynthesis({ language });
  const { 
    start: startListening, 
    stop: stopListening, 
    isListening: speechIsListening,
    transcript,
    reset: resetTranscript
  } = useSpeechRecognition({ language, continuous: false });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle speech recognition results
  useEffect(() => {
    if (transcript && !speechIsListening) {
      setInput(transcript);
      resetTranscript();
    }
  }, [transcript, speechIsListening, resetTranscript]);

  // Add welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: emergencyType 
          ? `Hello! I'm AidVoice, your emergency assistant. I see you might be dealing with a ${emergencyType} situation. I'm here to help guide you through this. What's happening right now?`
          : "Hello! I'm AidVoice, your emergency assistant. I'm here to help you with any emergency situation. How can I assist you today?",
        timestamp: Date.now()
      };
      setMessages([welcomeMessage]);
      
      // Optional: speak the welcome message
      speak(welcomeMessage.content);
    }
  }, [emergencyType, speak, messages.length]);

  const handleSendMessage = async () => {
    // Ensure input is always treated as a string and safely trim it
    const messageText = String(input || '').trim();
    
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // First, analyze the message for emergency content
      const emergencyAnalysisResponse = await fetch('/api/gemini/analyze-emergency', {
        method: 'POST',
        body: JSON.stringify({ text: messageText }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!emergencyAnalysisResponse.ok) {
        throw new Error(`Emergency analysis failed: ${emergencyAnalysisResponse.status}`);
      }
      
      const emergencyAnalysis = await emergencyAnalysisResponse.json();

      // If emergency detected, notify parent component
      if (emergencyAnalysis.isEmergency && onEmergencyDetected) {
        onEmergencyDetected(emergencyAnalysis.emergencyType, emergencyAnalysis.severity);
      }

      // Get conversational response
      const chatResponse = await fetch('/api/gemini/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          })),
          context: {
            emergencyType,
            language,
            emergencyAnalysis
          }
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!chatResponse.ok) {
        throw new Error(`Chat request failed: ${chatResponse.status}`);
      }
      
      const chatData = await chatResponse.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: chatData.response || 'I apologize, but I encountered an issue processing your request.',
        timestamp: Date.now(),
        isEmergency: emergencyAnalysis.isEmergency
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the response
      speak(assistantMessage.content);
      
      // Focus back on input
      inputRef.current?.focus();
      
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again. If this is an emergency, please call emergency services immediately.',
        timestamp: Date.now(),
        isEmergency: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      speak(errorMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      startListening();
      setIsListening(true);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col card-modern overflow-hidden">
      <CardHeader className="flex-shrink-0 border-b border-border/50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
        <CardTitle className="flex items-center gap-3">
          <div className="relative">
            <Bot className="h-6 w-6 text-blue-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <span className="text-gradient">AidVoice Chat Assistant</span>
          {emergencyType && (
            <Badge variant="destructive" className="ml-2 animate-pulse">
              <AlertCircle className="h-3 w-3 mr-1" />
              {emergencyType.charAt(0).toUpperCase() + emergencyType.slice(1)} Mode
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} slide-up`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                      : message.isEmergency
                      ? 'bg-gradient-to-br from-red-50 to-pink-50 text-red-900 border border-red-200 dark:from-red-950/30 dark:to-pink-950/30 dark:text-red-100 dark:border-red-800'
                      : 'bg-white/80 backdrop-blur-sm text-gray-900 border border-gray-200/50 dark:bg-gray-800/80 dark:text-gray-100 dark:border-gray-700/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {message.role === 'assistant' && (
                      <div className="relative">
                        <Bot className={`h-5 w-5 mt-1 flex-shrink-0 ${
                          message.isEmergency ? 'text-red-600 dark:text-red-400' : 'text-blue-600'
                        }`} />
                        {message.isEmergency && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                      </div>
                    )}
                    {message.role === 'user' && (
                      <User className="h-5 w-5 mt-1 flex-shrink-0 text-white/90" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                      <p className={`text-xs mt-2 opacity-70 ${
                        message.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                  {message.isEmergency && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span className="text-xs font-medium text-red-700 dark:text-red-300">Emergency detected</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start slide-up">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 max-w-[80%] border border-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Bot className="h-5 w-5 text-blue-600" />
                      <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-blue-400 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        AidVoice is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t border-border/50 p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950/30 flex-shrink-0">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message or ask for help..."
                disabled={isLoading}
                className="pr-14 h-12 rounded-xl border-2 border-gray-200/50 focus:border-blue-500/50 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 dark:border-gray-700/50 dark:focus:border-blue-400/50 transition-all duration-300"
                aria-label="Chat message input"
              />
              <Button
                type="button"
                size="sm"
                variant={isListening ? "destructive" : "secondary"}
                onClick={toggleListening}
                disabled={isLoading}
                className="absolute right-2 top-2 h-8 w-8 p-0 rounded-lg transition-all duration-300 hover:scale-105"
                aria-label={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!String(input || '').trim() || isLoading}
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {isListening && (
            <div className="mt-3 text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening... Speak now
            </div>
          )}
          
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
            Press Enter to send • Click mic for voice input • Emergency help available 24/7
          </div>
        </div>
      </CardContent>
    </Card>
  );
}