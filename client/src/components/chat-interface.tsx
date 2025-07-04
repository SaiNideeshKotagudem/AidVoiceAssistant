import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Bot, User, AlertCircle, Loader2 } from 'lucide-react';
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
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // First, analyze the message for emergency content
      const emergencyAnalysisResponse = await fetch('/api/gemini/analyze-emergency', {
        method: 'POST',
        body: JSON.stringify({ text: input.trim() }),
        headers: { 'Content-Type': 'application/json' }
      });
      const emergencyAnalysis = await emergencyAnalysisResponse.json();

      // If emergency detected, notify parent component
      if (emergencyAnalysis.isEmergency && onEmergencyDetected) {
        onEmergencyDetected(emergencyAnalysis.emergencyType, emergencyAnalysis.severity);
      }

      // Get conversational response
      const chatResponse = await fetch('/api/gemini/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: input.trim(),
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
      const chatData = await chatResponse.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: chatData.response,
        timestamp: Date.now(),
        isEmergency: emergencyAnalysis.isEmergency
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the response
      speak(chatData.response);
      
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
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          AidVoice Chat Assistant
          {emergencyType && (
            <Badge variant="destructive" className="ml-2">
              {emergencyType.charAt(0).toUpperCase() + emergencyType.slice(1)} Mode
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.isEmergency
                      ? 'bg-red-50 text-red-900 border border-red-200'
                      : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.role === 'assistant' && (
                      <Bot className={`h-4 w-4 mt-1 flex-shrink-0 ${
                        message.isEmergency ? 'text-red-600' : 'text-blue-600'
                      }`} />
                    )}
                    {message.role === 'user' && (
                      <User className="h-4 w-4 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 opacity-70`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                  {message.isEmergency && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-red-700">
                      <AlertCircle className="h-3 w-3" />
                      Emergency detected
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[70%]">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-600" />
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      AidVoice is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t p-4 flex-shrink-0">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message or ask for help..."
                disabled={isLoading}
                className="pr-12"
                aria-label="Chat message input"
              />
              <Button
                type="button"
                size="sm"
                variant={isListening ? "destructive" : "secondary"}
                onClick={toggleListening}
                disabled={isLoading}
                className="absolute right-1 top-1 h-8 w-8 p-0"
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
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {isListening && (
            <div className="mt-2 text-sm text-blue-600 flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening... Speak now
            </div>
          )}
          
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Press Enter to send • Click mic for voice input • Emergency help available 24/7
          </div>
        </div>
      </CardContent>
    </Card>
  );
}