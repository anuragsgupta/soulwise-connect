"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  UserCircle, 
  Send, 
  ShieldCheck, 
  Users,
  Circle,
  AlertCircle,
  Loader2
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'mentor';
  timestamp: Date;
}

const AnonymousMentorChat = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const connectToMentor = async () => {
    setIsSearching(true);
    
    // Simulate mentor matching
    setTimeout(() => {
      setIsSearching(false);
      setIsConnected(true);
      
      toast({
        title: "Connected to Mentor!",
        description: "You've been paired with an anonymous peer mentor.",
        duration: 3000,
      });

      // Welcome message from mentor
      const welcomeMessage: Message = {
        id: '1',
        content: "Hey there! 👋 I'm here to listen and support you. Everything shared here is completely anonymous and confidential. What's on your mind?",
        sender: 'mentor',
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
    }, 2000);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isTyping || !isConnected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate mentor response
    setTimeout(() => {
      const responses = [
        "I hear you. That sounds really challenging. Can you tell me more about how you're feeling?",
        "Thank you for sharing that. It takes courage to open up. How long have you been dealing with this?",
        "I understand. Have you tried any coping strategies that helped even a little?",
        "That must be tough. Remember, you're not alone in this. What kind of support would help you most right now?",
        "I appreciate you trusting me with this. Let's work through this together. What's the first step you'd like to take?"
      ];

      const mentorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: 'mentor',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, mentorMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2 text-blue-600" />
            Anonymous Peer Mentoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center text-sm text-blue-700">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>All conversations are completely anonymous and confidential</span>
          </div>
          <div className="flex items-center text-sm text-blue-700">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>You&apos;ll be matched with a trained peer mentor</span>
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      {!isConnected && !isSearching ? (
        <Card className="flex-1 flex items-center justify-center">
          <CardContent className="text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <UserCircle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Connect with a Peer Mentor</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Talk to someone who understands. Our peer mentors are trained students ready to listen and support you.
              </p>
            </div>
            <Button 
              onClick={connectToMentor}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              <Users className="w-4 h-4 mr-2" />
              Find a Mentor
            </Button>
          </CardContent>
        </Card>
      ) : isSearching ? (
        <Card className="flex-1 flex items-center justify-center">
          <CardContent className="text-center space-y-4 py-8">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Finding a Mentor...</h3>
              <p className="text-muted-foreground">
                Connecting you with an available peer mentor
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Connection Status */}
          <div className="flex items-center justify-between px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-800">Connected to Peer Mentor</span>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Anonymous
            </Badge>
          </div>

          {/* Messages Container */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className={`text-xs ${
                      message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg rounded-bl-none px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input Area */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default AnonymousMentorChat;
