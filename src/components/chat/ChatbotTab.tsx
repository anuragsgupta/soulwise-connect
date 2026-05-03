'use client';

import React, { useState, useEffect } from 'react';
import { Send, Settings, Eye, EyeOff, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getDemoGeminiApiKey, saveDemoGeminiApiKey } from '@/lib/demoDB';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotTabProps {
  studentId?: string;
  isDemoUser?: boolean;
}

export default function ChatbotTab({ studentId = 'demo-student-123', isDemoUser = true }: ChatbotTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [displayApiKey, setDisplayApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load API key on mount
  useEffect(() => {
    if (isDemoUser) {
      loadApiKey();
    }
  }, [isDemoUser]);

  const loadApiKey = async () => {
    try {
      const key = await getDemoGeminiApiKey();
      if (key) {
        setApiKey(key);
        setDisplayApiKey('*'.repeat(20));
        setHasApiKey(true);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const truncateToHundredWords = (text: string): string => {
    const words = text.split(/\s+/);
    if (words.length > 100) {
      return words.slice(0, 100).join(' ') + '...';
    }
    return text;
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setError('API key cannot be empty');
      return;
    }

    try {
      setError(null);
      await saveDemoGeminiApiKey(apiKey.trim());
      setDisplayApiKey('*'.repeat(20));
      setShowApiKey(false);
      setHasApiKey(true);
      setShowApiKeyDialog(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: '✅ Gemini API key configured successfully! I can now help you with more advanced features.',
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setError('Failed to save API key');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      if (!hasApiKey) {
        setError('Please configure Gemini API key in settings first');
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content:
              '⚠️ Please configure your Gemini API key first. Click the ⚙️ settings button to add it.',
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
        return;
      }

      // Call Gemini API with the stored API key
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: userMessage.content,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response from Gemini API');
      }

      const data = await response.json();
      let assistantContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response. Please try again.';
      assistantContent = truncateToHundredWords(assistantContent);

      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `❌ Error: ${errorMessage}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">🤖</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Soulwise Chatbot</h2>
            <p className="text-xs text-gray-500">
              {hasApiKey ? '✅ Ready to chat' : '⚠️ API key not configured'}
            </p>
          </div>
        </div>

        {isDemoUser && (
          <button
            onClick={() => setShowApiKeyDialog(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Configure Gemini API Key"
          >
            ⚙️
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">💬</div>
              <p className="font-medium">Start a conversation</p>
              <p className="text-sm">Share your thoughts and I&apos;ll listen and help</p>
              {!hasApiKey && (
                <button
                  onClick={() => setShowApiKeyDialog(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Gemini API Key
                </button>
              )}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs px-4 py-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
              }`}
            >
              <div className={`text-sm ${msg.role === 'user' ? 'text-white' : 'text-gray-900'}`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <ReactMarkdown className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0 prose-ul:my-1 prose-ol:my-1">
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
              <p className="text-xs mt-2 opacity-70">{msg.timestamp.toLocaleTimeString()}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 px-4 py-3 rounded-lg border border-gray-200">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <div className="bg-red-100 text-red-800 px-4 py-3 rounded-lg border border-red-300 text-sm">
              ⚠️ {error}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4 shadow-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder="Type your message here..."
            disabled={isLoading || !hasApiKey}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim() || !hasApiKey}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
          >
            <Send size={18} />
          </button>
        </div>
        {!hasApiKey && (
          <p className="text-xs text-red-600 mt-2">
            ⚠️ Please configure Gemini API key to start chatting
          </p>
        )}
      </div>

      {/* API Key Dialog */}
      {showApiKeyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">Configure Gemini API Key</h3>
              <button
                onClick={() => setShowApiKeyDialog(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">{error}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gemini API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={showApiKey ? apiKey : displayApiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={hasApiKey && !showApiKey}
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  >
                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Get your key from{' '}
                  <a href="https://ai.google.dev/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Google AI Studio
                  </a>
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
                <p>
                  <strong>🔒 Your API key is stored securely in your browser.</strong> It&apos;s never sent to
                  our servers.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveApiKey}
                  disabled={!apiKey.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  Save API Key
                </button>
                <button
                  onClick={() => setShowApiKeyDialog(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
