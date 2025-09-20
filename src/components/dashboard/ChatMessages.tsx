import { User, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FormattedMessage from "@/components/ui/formatted-message";

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'suggestion' | 'warning' | 'resource';
}

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const ChatMessages = ({ messages, isTyping, messagesEndRef }: ChatMessagesProps) => (
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
            {message.sender === 'bot' ? (
              <FormattedMessage content={message.content} className="text-sm" />
            ) : (
              <p className="text-sm">{message.content}</p>
            )}
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
    <div ref={messagesEndRef} />
  </div>
);

export default ChatMessages;
