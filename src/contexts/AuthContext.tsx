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
  login: (email: string, password: string, enrollmentId?: string) => Promise<boolean>;
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
    const verifySession = async () => {
      try {
        console.log('🔐 AuthContext: Verifying session...');
        
        // Always verify session with server (checks HTTP-only cookie)
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include', // Important: include HTTP-only cookies
          cache: 'no-store' // Prevent caching of auth verification
        });
        
        console.log('📥 AuthContext: Verify response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ AuthContext: Session verified successfully', {
            success: result.success,
            hasUser: !!result.data?.user,
            userType: result.data?.user?.userType
          });
          
          if (result.success && result.data) {
            setUser(result.data.user);
            setToken(result.data.token);
            // Update localStorage for client-side quick checks (non-sensitive)
            localStorage.setItem('auth-user', JSON.stringify(result.data.user));
          } else {
            console.log('⚠️ AuthContext: Response OK but no valid data');
            // Clear stale data
            setUser(null);
            setToken(null);
            localStorage.removeItem('auth-user');
          }
        } else if (response.status === 401) {
          console.log('❌ AuthContext: No valid session (401)');
          // No valid session
          setUser(null);
          setToken(null);
          localStorage.removeItem('auth-user');
        }
      } catch (error) {
        console.error('❌ AuthContext: Error verifying session:', error);
        // On network error, don't change auth state
        // This prevents logout during temporary network issues
      } finally {
        console.log('🏁 AuthContext: Verification complete, setting isLoading to false');
        setIsLoading(false);
      }
    };
    
    verifySession();
  }, []);

  // Auto-refresh session every 30 minutes to keep it alive
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setUser(result.data.user);
            setToken(result.data.token);
            localStorage.setItem('auth-token', result.data.token);
            localStorage.setItem('auth-user', JSON.stringify(result.data.user));
          }
        } else {
          // Session expired on server, logout
          console.warn('Session expired, logging out...');
          logout();
        }
      } catch (error) {
        console.error('Session refresh error:', error);
        // Don't logout on network error
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  const login = async (email: string, password: string, enrollmentId?: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('🔐 AuthContext: Attempting login...', { email, enrollmentId: !!enrollmentId });
      
      // Clear any old tokens from localStorage
      localStorage.removeItem('auth-token');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies in request
        body: JSON.stringify({ 
          email: enrollmentId ? undefined : email, 
          password,
          enrollmentId 
        }),
      });

      const result = await response.json();
      console.log('📥 AuthContext: Login response:', { 
        success: result.success, 
        userType: result.data?.user?.userType,
        adminType: result.data?.user?.adminType,
        isSuperAdmin: result.data?.user?.isSuperAdmin
      });

      if (result.success && result.data) {
        const { token: authToken, user: userData } = result.data;
        
        console.log('✅ AuthContext: Setting user data:', {
          userType: userData.userType,
          adminType: userData.adminType,
          isSuperAdmin: userData.isSuperAdmin,
          role: userData.role
        });
        
        setToken(authToken);
        setUser(userData);
        
        // Keep localStorage as backup (non-sensitive data only)
        // The actual auth token is in HTTP-only cookie
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

  const logout = async () => {
    try {
      // Clear HTTP-only cookie via API call
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with client-side logout even if API fails
    } finally {
      // Always clear client-side state
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth-user');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('studentSession');
    }
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
