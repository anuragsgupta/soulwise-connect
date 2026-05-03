'use client';

/**
 * Example: Integrating Settings into Your Component
 * 
 * This file shows how to add the API Key Settings UI to your existing components.
 */

import React, { useState } from 'react';
import SettingsModal from '@/components/settings/SettingsModal';

// Example 1: Add settings button to navbar
export function NavbarWithSettings() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <nav className="flex items-center justify-between p-4 bg-white border-b">
        <h1 className="text-2xl font-bold">Soulwise Connect</h1>
        
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Settings"
        >
          ⚙️ Settings
        </button>
      </nav>

      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}

// Example 2: Add settings to user profile dropdown
export function ProfileDropdownWithSettings() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
        >
          👤 Profile
        </button>

        {profileOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
            <button className="w-full text-left px-4 py-2 hover:bg-gray-50">
              View Profile
            </button>
            <button
              onClick={() => {
                setSettingsOpen(true);
                setProfileOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50"
            >
              ⚙️ Settings
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 border-t">
              Logout
            </button>
          </div>
        )}
      </div>

      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}

// Example 3: Standalone settings component for admin panel
export function AdminSettingsPage() {
  const [settingsOpen, setSettingsOpen] = useState(true);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      
      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

// Example 4: Using in Chatbot Component
import { sendChatbotMessage } from '@/lib/chatbot-api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export function ChatbotWithSettings() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    try {
      setError(null);
      setLoading(true);

      // Add user message to UI
      const userMessage: ChatMessage = {
        role: 'user',
        content: input,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');

      // Send to API (API key automatically included from IndexedDB)
      const response = await sendChatbotMessage({
        userId: 'user-123', // Use actual user ID
        message: input,
        messageHistory: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      if (!response.success) {
        setError(response.error || 'Failed to get response');
        
        // Show hint if API key not configured
        if (response.hint) {
          setError(`${response.error}\n\nℹ️ ${response.hint}`);
        }
        return;
      }

      // Add assistant message to UI
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message || 'No response received',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      // If error is about API key, suggest opening settings
      if (errorMessage.includes('API key')) {
        setError(`${errorMessage}\n\nℹ️ Click "Settings" to configure your API key`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header with settings */}
      <div className="flex justify-between items-center p-4 bg-white border-b">
        <h1 className="text-2xl font-bold">Chatbot</h1>
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Open settings to configure API key"
        >
          ⚙️
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
              💭 Thinking...
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg">
              ⚠️ {error}
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            Send
          </button>
        </div>
      </div>

      {/* Settings modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
