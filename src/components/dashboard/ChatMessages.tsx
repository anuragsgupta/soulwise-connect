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
  <div className="space-y-3 px-2">
    {messages.map((message) => (
      <div
        key={message.id}
        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
      >
        <div className={`flex items-end space-x-2 max-w-[75%] ${
          message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
        }`}>
          {/* Avatar - smaller and at bottom */}
          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
            message.sender === 'user' 
              ? 'bg-gradient-to-br from-teal-500 to-teal-600' 
              : 'bg-gradient-to-br from-orange-400 to-orange-500'
          }`}>
            {message.sender === 'user' ? (
              <User className="w-3.5 h-3.5 text-white" />
            ) : (
              <Bot className="w-3.5 h-3.5 text-white" />
            )}
          </div>
          
          {/* Message Bubble with WhatsApp style */}
          <div className="flex flex-col">
            <div className={`relative rounded-lg px-3 py-2 shadow-sm ${
              message.sender === 'user'
                ? 'bg-teal-600 text-white rounded-br-none'
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
            }`}>
              {/* WhatsApp-style tail */}
              <div className={`absolute bottom-0 w-3 h-3 ${
                message.sender === 'user'
                  ? 'right-0 -mr-1.5 bg-teal-600'
                  : 'left-0 -ml-1.5 bg-white border-l border-b border-gray-200'
              }`} 
              style={{
                clipPath: message.sender === 'user' 
                  ? 'polygon(0 0, 100% 0, 100% 100%)' 
                  : 'polygon(0 0, 0 100%, 100% 100%)'
              }}
              />
              
              {/* Message Content */}
              {message.sender === 'bot' ? (
                <FormattedMessage 
                  content={message.content} 
                  className="text-sm leading-relaxed text-gray-800"
                />
              ) : (
                <p className="text-sm leading-relaxed">{message.content}</p>
              )}
              
              {/* Badge for special message types */}
              {message.type && (
                <Badge 
                  variant="secondary" 
                  className={`mt-1.5 text-xs ${
                    message.type === 'warning' ? 'bg-red-100 text-red-800' :
                    message.type === 'suggestion' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}
                >
                  {message.type === 'warning' ? '⚠️ Important' :
                   message.type === 'suggestion' ? '💡 Suggestion' : '📚 Resource'}
                </Badge>
              )}
              
              {/* Timestamp inside bubble */}
              <div className={`flex items-center justify-end mt-1 space-x-1 ${
                message.sender === 'user' ? 'text-teal-100' : 'text-gray-500'
              }`}>
                <span className="text-[10px] leading-none">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {message.sender === 'user' && (
                  <svg className="w-3 h-3 text-teal-100" viewBox="0 0 16 15" fill="none">
                    <path d="M15 1L5.5 10.5L1 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
    
    {/* Typing Indicator */}
    {isTyping && (
      <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-end space-x-2">
          <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="bg-white rounded-lg rounded-bl-none px-4 py-3 shadow-sm border border-gray-200">
            <div className="flex space-x-1.5">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    )}
    <div ref={messagesEndRef} />
  </div>
);

export default ChatMessages;
