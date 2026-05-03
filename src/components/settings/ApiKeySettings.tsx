'use client';

import React, { useState, useEffect } from 'react';
import { 
  getGeminiApiKey, 
  saveGeminiApiKey, 
  deleteGeminiApiKey,
  hasGeminiApiKey 
} from '@/lib/indexedDB/apiKeyStore';

interface ApiKeySettingsProps {
  onSave?: () => void;
  onClose?: () => void;
}

export default function ApiKeySettings({ onSave, onClose }: ApiKeySettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [displayKey, setDisplayKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      setLoading(true);
      const key = await getGeminiApiKey();
      if (key) {
        setApiKey(key);
        setDisplayKey('*'.repeat(20)); // Show masked version
        setHasKey(true);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
      setMessage({ type: 'error', text: 'Failed to load API key' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'API key cannot be empty' });
      return;
    }

    try {
      setSaving(true);
      await saveGeminiApiKey(apiKey.trim());
      setMessage({ type: 'success', text: 'API key saved successfully!' });
      setDisplayKey('*'.repeat(20));
      setShowKey(false);
      setHasKey(true);
      
      setTimeout(() => {
        if (onSave) onSave();
      }, 1000);
    } catch (error) {
      console.error('Error saving API key:', error);
      setMessage({ type: 'error', text: 'Failed to save API key' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (!window.confirm('Are you sure you want to delete your API key?')) {
      return;
    }

    try {
      setSaving(true);
      await deleteGeminiApiKey();
      setApiKey('');
      setDisplayKey('');
      setHasKey(false);
      setMessage({ type: 'success', text: 'API key deleted successfully' });
    } catch (error) {
      console.error('Error deleting API key:', error);
      setMessage({ type: 'error', text: 'Failed to delete API key' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
      <h2 className="text-2xl font-bold mb-4">API Key Settings</h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gemini API Key
          </label>
          <div className="flex gap-2">
            <input
              type={showKey ? 'text' : 'password'}
              value={showKey ? apiKey : displayKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!showKey && hasKey}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? '👁️‍🗨️' : '👁️'}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Get your API key from{' '}
            <a
              href="https://ai.google.dev/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>

        <div className="flex gap-2">
          {hasKey ? (
            <>
              <button
                onClick={handleSaveApiKey}
                disabled={saving || !apiKey.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {saving ? 'Updating...' : 'Update Key'}
              </button>
              <button
                onClick={handleDeleteApiKey}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
              >
                {saving ? 'Deleting...' : 'Delete Key'}
              </button>
            </>
          ) : (
            <button
              onClick={handleSaveApiKey}
              disabled={saving || !apiKey.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {saving ? 'Saving...' : 'Save API Key'}
            </button>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
        <strong>Note:</strong> Your API key is stored securely in your browser's local storage
        (IndexedDB) and is never sent to our servers.
      </div>
    </div>
  );
}
