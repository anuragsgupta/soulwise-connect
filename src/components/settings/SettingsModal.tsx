'use client';

import React, { useState } from 'react';
import ApiKeySettings from '@/components/settings/ApiKeySettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'api-keys' | 'profile' | 'privacy'>('api-keys');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
              activeTab === 'api-keys'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔑 API Keys
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
              activeTab === 'profile'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👤 Profile
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
              activeTab === 'privacy'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔒 Privacy
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'api-keys' && (
            <ApiKeySettings 
              onSave={onClose}
              onClose={onClose}
            />
          )}

          {activeTab === 'profile' && (
            <div className="text-center text-gray-500">
              <p>Profile settings coming soon</p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="text-center text-gray-500">
              <p>Privacy settings coming soon</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
