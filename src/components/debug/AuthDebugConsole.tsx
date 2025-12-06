'use client';

import React, { useState, useEffect } from 'react';
import { X, Bug, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  details?: unknown;
}

export default function AuthDebugConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProd, setIsProd] = useState(false);

  useEffect(() => {
    setIsProd(window.location.hostname !== 'localhost');
  }, []);

  const addLog = (type: LogEntry['type'], message: string, details?: unknown) => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      details
    }]);
  };

  const formatDetails = (details: unknown): string => {
    try {
      return typeof details === 'string' 
        ? details 
        : JSON.stringify(details, null, 2);
    } catch {
      return String(details);
    }
  };

  const checkEnvironment = async () => {
    addLog('info', '🔍 Checking environment variables...');
    
    const envVars = {
      'NEXT_PUBLIC_GEMINI_API_KEY': process.env.NEXT_PUBLIC_GEMINI_API_KEY?.substring(0, 10) + '...',
      'NEXT_PUBLIC_AWS_REGION': process.env.NEXT_PUBLIC_AWS_REGION,
      'NEXT_PUBLIC_AWS_ACCESS_KEY_ID': process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID?.substring(0, 10) + '...',
      'NODE_ENV': process.env.NODE_ENV,
    };

    addLog('info', 'Environment variables:', envVars);
  };

  const checkCookies = () => {
    addLog('info', '🍪 Checking cookies...');
    
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const hasCookie = 'auth-token' in cookies;
    
    addLog(hasCookie ? 'success' : 'warning', 
      hasCookie ? 'Auth token cookie found' : 'No auth-token cookie found',
      { cookies: Object.keys(cookies) }
    );
  };

  const checkLocalStorage = () => {
    addLog('info', '💾 Checking localStorage...');
    
    const authUser = localStorage.getItem('auth-user');
    const token = localStorage.getItem('token');
    
    addLog(authUser ? 'success' : 'warning',
      authUser ? 'User data in localStorage' : 'No user data in localStorage',
      authUser ? JSON.parse(authUser) : null
    );

    addLog(token ? 'info' : 'warning',
      token ? 'Token in localStorage (backup)' : 'No token in localStorage'
    );
  };

  const testVerifyEndpoint = async () => {
    addLog('info', '🔐 Testing /api/auth/verify endpoint...');
    
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      addLog('info', `Response status: ${response.status}`, { headers: responseHeaders });

      if (response.ok) {
        const data = await response.json();
        addLog('success', '✅ Verify endpoint successful', data);
      } else {
        const text = await response.text();
        addLog('error', `❌ Verify endpoint failed: ${response.status}`, { body: text });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', '❌ Network error calling verify', { error: errorMessage });
    }
  };

  const testLoginEndpoint = async () => {
    addLog('info', '🔑 Testing /api/auth/login endpoint (test credentials)...');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId: '0103CS243D07',
          password: '12345678'
        })
      });

      addLog('info', `Response status: ${response.status}`);

      const data = await response.json();
      
      if (response.ok) {
        addLog('success', '✅ Login successful', {
          success: data.success,
          userType: data.data?.user?.userType,
          hasToken: !!data.data?.token
        });
      } else {
        addLog('error', `❌ Login failed: ${response.status}`, data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', '❌ Network error calling login', { error: errorMessage });
    }
  };

  const checkDatabaseConnection = async () => {
    addLog('info', '🗄️ Testing database connection...');
    
    try {
      // Call dedicated debug endpoint
      const response = await fetch('/api/debug/env', {
        method: 'GET',
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          addLog('success', '✅ Environment check complete', {
            warnings: data.warnings,
            database: data.database.test,
            hasJWT: data.environment.JWT_SECRET,
            hasDB: data.environment.DATABASE_URL
          });
          
          if (data.warnings && data.warnings.length > 0) {
            addLog('warning', '⚠️ Configuration issues found', data.warnings);
          }
          
          if (data.database.error) {
            addLog('error', '❌ Database connection failed', { error: data.database.error });
          }
        } else {
          addLog('error', '❌ Environment check failed', data);
        }
      } else {
        addLog('error', '❌ Server error during env check');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', '❌ Cannot reach server', { error: errorMessage });
    }
  };

  const runAllTests = async () => {
    setLogs([]);
    addLog('info', '🚀 Starting comprehensive diagnostics...');
    addLog('info', `Environment: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    
    checkEnvironment();
    checkCookies();
    checkLocalStorage();
    await checkDatabaseConnection();
    await testVerifyEndpoint();
    
    addLog('info', '✅ Diagnostics complete!');
  };

  const clearLogs = () => setLogs([]);

  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all"
        title="Open Auth Debug Console"
      >
        <Bug className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[600px] max-h-[80vh] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Auth Debug Console</h3>
          {isProd && (
            <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">PROD</span>
          )}
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-gray-700 flex gap-2 flex-wrap">
        <button
          onClick={runAllTests}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Run All Tests
        </button>
        <button
          onClick={testVerifyEndpoint}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
        >
          Test Verify
        </button>
        <button
          onClick={testLoginEndpoint}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
        >
          Test Login
        </button>
        <button
          onClick={clearLogs}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded"
        >
          Clear
        </button>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Click &quot;Run All Tests&quot; to start diagnostics
          </p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex gap-2 items-start">
              <span className="text-gray-500 text-xs shrink-0">{log.timestamp}</span>
              {getIcon(log.type)}
              <div className="flex-1 min-w-0">
                <p className="text-gray-200 break-words">{log.message}</p>
                {log.details !== undefined && (
                  <pre className="mt-1 text-xs text-gray-400 bg-gray-800 p-2 rounded overflow-x-auto">
                    {formatDetails(log.details)}
                  </pre>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
