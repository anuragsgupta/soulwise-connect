import { User, Bot, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FormattedMessage from "@/components/ui/formatted-message";

export interface QuickReply {
  id: string;
  label: string;
  value: string;
}

export interface ResourceAction {
  id: string;
  label: string;
  type: 'message' | 'navigate' | 'dismiss';
  value?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface ResourceCard {
  title: string;
  subtitle?: string;
  description: string;
  tag?: string;
  actions: ResourceAction[];
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'suggestion' | 'warning' | 'resource';
  quickReplies?: QuickReply[];
  resourceCard?: ResourceCard;
}

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onQuickReply: (messageId: string, value: string) => void;
  onResourceAction: (messageId: string, action: ResourceAction) => void;
}

const ChatMessages = ({ messages, isTyping, messagesEndRef, onQuickReply, onResourceAction }: ChatMessagesProps) => (
  <div className="space-y-3 px-2">
    {messages.map((message) => (
      <div
        key={message.id}
        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
      >
        <div className={`flex items-end space-x-2 max-w-[75%] ${
          message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
        }`}>
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

          <div className="flex flex-col">
            <div className={`relative rounded-lg px-3 py-2 shadow-sm ${
              message.sender === 'user'
                ? 'bg-teal-600 text-white rounded-br-none'
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
            }`}>
              <div
                className={`absolute bottom-0 w-3 h-3 ${
                  message.sender === 'user'
                    ? 'right-0 -mr-1.5 bg-teal-600'
                    : 'left-0 -ml-1.5 bg-white border-l border-b border-gray-200'
                }`}
                style={{
                  clipPath:
                    message.sender === 'user'
                      ? 'polygon(0 0, 100% 0, 100% 100%)'
                      : 'polygon(0 0, 0 100%, 100% 100%)',
                }}
              />

              {message.sender === 'bot' ? (
                <FormattedMessage
                  content={message.content}
                  className="text-sm leading-relaxed text-gray-800"
                />
              ) : (
                <p className="text-sm leading-relaxed">{message.content}</p>
              )}

              {message.type && (
                <Badge
                  variant="secondary"
                  className={`mt-1.5 text-xs ${
                    message.type === 'warning'
                      ? 'bg-red-100 text-red-800'
                      : message.type === 'suggestion'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {message.type === 'warning'
                    ? '⚠️ Important'
                    : message.type === 'suggestion'
                    ? '💡 Suggestion'
                    : '📚 Resource'}
                </Badge>
              )}

              <div
                className={`mt-1 flex items-center justify-end space-x-1 ${
                  message.sender === 'user' ? 'text-teal-100' : 'text-gray-500'
                }`}
              >
                <span className="text-[10px] leading-none">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {message.sender === 'user' && (
                  <svg className="h-3 w-3 text-teal-100" viewBox="0 0 16 15" fill="none">
                    <path
                      d="M15 1L5.5 10.5L1 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>

            {message.sender === 'bot' && message.quickReplies && message.quickReplies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.quickReplies.map((reply) => (
                  <Button
                    key={reply.id}
                    variant="outline"
                    size="sm"
                    className="rounded-full border-teal-200 bg-white/70 text-teal-700 transition hover:bg-teal-50"
                    onClick={() => onQuickReply(message.id, reply.value)}
                  >
                    {reply.label}
                  </Button>
                ))}
              </div>
            )}

            {message.sender === 'bot' && message.resourceCard && (
              <div className="mt-3 rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/90 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-200 via-orange-100 to-teal-100">
                    <Compass className="h-4 w-4 text-teal-700" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="text-sm font-semibold text-teal-900">{message.resourceCard.title}</h4>
                      {message.resourceCard.subtitle && (
                        <p className="text-xs font-medium uppercase tracking-wide text-teal-600/80">
                          {message.resourceCard.subtitle}
                        </p>
                      )}
                      <p className="mt-1 text-sm leading-relaxed text-slate-700">
                        {message.resourceCard.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {message.resourceCard.actions.map((action) => (
                        <Button
                          key={action.id}
                          size="sm"
                          variant={
                            action.variant === 'secondary'
                              ? 'outline'
                              : action.variant === 'ghost'
                              ? 'ghost'
                              : 'default'
                          }
                          className={
                            action.variant === 'ghost'
                              ? 'text-slate-600'
                              : action.variant === 'secondary'
                              ? 'border-teal-200 text-teal-700 hover:bg-teal-50'
                              : 'bg-teal-600 text-white hover:bg-teal-700'
                          }
                          onClick={() => onResourceAction(message.id, action)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                {message.resourceCard.tag && (
                  <div className="mt-3">
                    <Badge variant="secondary" className="bg-white/70 text-teal-700">
                      {message.resourceCard.tag}
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    ))}

    {isTyping && (
      <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-end space-x-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-500">
            <Bot className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="rounded-lg rounded-bl-none border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex space-x-1.5">
              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.1s' }}></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    )}
    <div ref={messagesEndRef} />
  </div>
);

export default ChatMessages;
