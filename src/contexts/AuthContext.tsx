'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  userType?: 'ADMIN' | 'FACULTY' | 'STUDENT';
  // Admin-specific fields
  adminType?: 'SUPER_ADMIN' | 'UNIVERSITY_ADMIN' | 'INSTITUTE_ADMIN';
  isSuperAdmin?: boolean;
  // Faculty-specific fields
  facultyType?: string;
  departmentId?: string;
  // Student-specific fields
  rollNumber?: string;
  batchId?: string;
  // Common fields
  universityId?: string;
  instituteId?: string;
  university?: any;
  institute?: any;
  department?: any;
  batch?: any;
  // Legacy support
  role?: 'SUPER_ADMIN' | 'UNIVERSITY_ADMIN' | 'INSTITUTE_ADMIN' | 'FACULTY' | 'STUDENT';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, rollNumber?: string) => Promise<boolean>;
  register: (email: string, password: string, role: string, universityId?: string, instituteId?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('auth-token');
      const savedUser = localStorage.getItem('auth-user');
      
      if (savedToken && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setToken(savedToken);
          setUser(parsedUser);
        } catch (parseError) {
          console.error('Error parsing saved user:', parseError);
          // Clear invalid data
          localStorage.removeItem('auth-token');
          localStorage.removeItem('auth-user');
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, rollNumber?: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: rollNumber ? undefined : email, 
          password,
          rollNumber 
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const { token: authToken, user: userData } = result.data;
        
        setToken(authToken);
        setUser(userData);
        
        localStorage.setItem('auth-token', authToken);
        localStorage.setItem('auth-user', JSON.stringify(userData));
        
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (
    email: string, 
    password: string, 
    role: string,
    universityId?: string,
    instituteId?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          role,
          universityId,
          instituteId
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
