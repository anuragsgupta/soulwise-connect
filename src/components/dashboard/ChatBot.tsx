"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Heart, 
  Brain,
  Phone,
  AlertTriangle,
  Lightbulb,
  Calendar
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'suggestion' | 'warning' | 'resource';
}

const ChatBot = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI mental health companion. I'm here to listen, support, and guide you through any challenges you're facing. How are you feeling today?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const generateBotResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Analyze user message for keywords and provide appropriate responses
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
      return {
        id: Date.now().toString(),
        content: "I understand you're feeling anxious. Anxiety is a common experience, especially during college years. Here's a quick breathing exercise: Take a deep breath in for 4 counts, hold for 4, then exhale for 6. Try this 3 times. Would you like me to guide you through more coping strategies?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'suggestion'
      };
    }
    
    if (lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed') || lowerMessage.includes('pressure')) {
      return {
        id: Date.now().toString(),
        content: "Feeling overwhelmed is completely normal when dealing with academic pressures. Let's break this down: What's the main source of your stress right now? Sometimes just talking about it can help us find manageable solutions together.",
        sender: 'bot',
        timestamp: new Date(),
      };
    }
    
    if (lowerMessage.includes('depressed') || lowerMessage.includes('sad') || lowerMessage.includes('hopeless')) {
      return {
        id: Date.now().toString(),
        content: "I'm concerned about how you're feeling. These emotions are important and deserve attention. While I can offer support, I strongly recommend speaking with a professional counselor. Would you like me to help you schedule an appointment with our campus mental health services?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'warning'
      };
    }
    
    if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('tired')) {
      return {
        id: Date.now().toString(),
        content: "Sleep issues can significantly impact your mental health. Here are some tips: 1) Set a consistent sleep schedule, 2) Avoid screens 1 hour before bed, 3) Try relaxation techniques like progressive muscle relaxation. Would you like me to share some guided sleep resources?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'resource'
      };
    }
    
    if (lowerMessage.includes('exam') || lowerMessage.includes('test') || lowerMessage.includes('study')) {
      return {
        id: Date.now().toString(),
        content: "Academic stress is very common! Here are some strategies: 1) Break study sessions into 25-minute chunks, 2) Practice active recall instead of just re-reading, 3) Take regular breaks to prevent burnout. Remember, your worth isn't defined by grades. How can I help you create a study plan that feels manageable?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'suggestion'
      };
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('counselor') || lowerMessage.includes('therapy')) {
      return {
        id: Date.now().toString(),
        content: "I'm glad you're seeking help - that takes courage! Our campus has excellent mental health resources. I can help you: 1) Schedule a counseling appointment, 2) Find peer support groups, 3) Access crisis support if needed. What kind of support would be most helpful for you right now?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'resource'
      };
    }
    
    if (lowerMessage.includes('good') || lowerMessage.includes('better') || lowerMessage.includes('fine') || lowerMessage.includes('okay')) {
      return {
        id: Date.now().toString(),
        content: "That's wonderful to hear! I'm glad you're doing well. Remember, it's great to check in even when things are going smoothly. Is there anything specific that's been helping you maintain your positive mood? Sharing strategies can help other students too!",
        sender: 'bot',
        timestamp: new Date(),
      };
    }

    // Default supportive response
    const defaultResponses = [
      "Thank you for sharing that with me. Your feelings are valid and important. Can you tell me more about what's been on your mind?",
      "I appreciate you opening up. Mental health is a journey, and I'm here to support you through it. What would be most helpful for you right now?",
      "It sounds like you're going through something important. Would you like to explore some coping strategies, or would you prefer to talk about what's bothering you?",
      "I'm here to listen and support you. Every step you take towards caring for your mental health matters, no matter how small it might seem."
    ];
    
    return {
      id: Date.now().toString(),
      content: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
      sender: 'bot',
      timestamp: new Date(),
    };
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Show confirmation toast
    toast({
      title: "Message sent",
      description: "Your message has been received. Our AI is thinking...",
      duration: 2000,
    });

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      
      // Show response notification
      toast({
        title: "AI Response Ready",
        description: "Your mental health companion has responded.",
        duration: 3000,
      });
    }, 1500);
  };

  const handleQuickAction = (actionText: string) => {
    setInputMessage(actionText);
    
    // Show feedback for quick action selection
    toast({
      title: "Quick Action Selected",
      description: `"${actionText}" has been added to your message. Click send to continue.`,
      duration: 3000,
    });

    // Auto-focus the input field
    setTimeout(() => {
      const inputElement = document.querySelector('input[placeholder="Share what\'s on your mind..."]') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 100);
  };

  const quickActions = [
    { text: "I'm feeling anxious", icon: AlertTriangle },
    { text: "I need study tips", icon: Lightbulb },
    { text: "Book counselor appointment", icon: Calendar },
    { text: "Emergency support", icon: Phone }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <MessageCircle className="w-6 h-6 mr-3 text-primary animate-pulse-soft" />
            AI Mental Health Support
          </CardTitle>
          <CardDescription>
            Your 24/7 mental health companion. Everything shared here is confidential and supportive.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Chat Messages */}
          <ScrollArea className="h-96 mb-4 border rounded-lg p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-gradient-to-r from-wellness to-support text-white'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-primary text-white ml-2'
                        : 'bg-muted mr-2'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      {message.type && (
                        <Badge 
                          variant="secondary" 
                          className={`mt-2 text-xs ${
                            message.type === 'warning' ? 'bg-red-100 text-red-800' :
                            message.type === 'suggestion' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}
                        >
                          {message.type === 'warning' ? 'Important' :
                           message.type === 'suggestion' ? 'Suggestion' : 'Resource'}
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-wellness to-support text-white rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.text)}
                  className="text-xs hover:bg-primary/10 hover:text-primary hover:border-primary transition-all duration-200 hover:scale-105"
                >
                  <action.icon className="w-3 h-3 mr-1" />
                  {action.text}
                </Button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="flex space-x-2">
            <Input
              placeholder="Share what's on your mind..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()}
              className="flex-1 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              disabled={isTyping}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputMessage.trim() || isTyping}
              className={`bg-gradient-to-r from-primary to-wellness hover:from-primary/90 hover:to-wellness/90 transition-all duration-200 ${
                isTyping ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
            >
              {isTyping ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Crisis Support Card */}
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <Phone className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Need immediate help?</h3>
              <p className="text-sm text-red-700">
                Crisis Helpline: <strong>1800-599-0019</strong> (KIRAN Mental Health)
              </p>
              <p className="text-xs text-red-600 mt-1">Available 24/7 for emergency mental health support</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatBot;