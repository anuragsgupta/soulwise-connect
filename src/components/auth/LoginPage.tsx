'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Brain, Mail, Lock, Users, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent, userType: 'student' | 'admin') => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          userType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store user data and token
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      toast({
        title: 'Welcome!',
        description: 'Login successful. Redirecting to your dashboard...',
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'An error occurred during login',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (userType: 'student' | 'admin', role?: string) => {
    // Simulate successful login with demo data
    const demoUser = {
      userType,
      email: userType === 'student' ? 'student@example.com' : 'admin@example.com',
      role: role || (userType === 'admin' ? 'SuperAdmin' : 'Student'),
      userId: '123',
      ...(userType === 'admin' && { universityId: '1', instituteId: '1' }),
      ...(userType === 'student' && { enrollmentId: 'STU001', instituteId: '1' }),
    };

    localStorage.setItem('user', JSON.stringify(demoUser));
    localStorage.setItem('token', 'demo-token-' + Date.now());

    toast({
      title: 'Demo Login Successful',
      description: `Logged in as ${role || userType}. Redirecting to dashboard...`,
    });

    // Redirect Faculty to their specific dashboard
    if (role === 'Faculty') {
      router.push('/faculty');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <Brain className="w-12 h-12 text-primary mr-3" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Mann Mitra
              </h1>
              <p className="text-muted-foreground">University Registration Portal</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="admin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Administrator Login
            </TabsTrigger>
            <TabsTrigger value="student" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Student Login
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admin">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Admin Login Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Administrator Login
                  </CardTitle>
                  <CardDescription>
                    Access your university management dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleLogin(e, 'admin')} className="space-y-4">
                    <div>
                      <Label htmlFor="admin-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="admin@university.edu"
                          value={credentials.email}
                          onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="admin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="admin-password"
                          type="password"
                          placeholder="Enter your password"
                          value={credentials.password}
                          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Admin Demo Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Demo Access</CardTitle>
                  <CardDescription>
                    Try different admin roles without credentials
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert>
                    <AlertDescription>
                      Click any button below to experience the portal as different admin types.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={() => handleDemoLogin('admin', 'SuperAdmin')}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                    variant="default"
                  >
                    Demo as Super Admin
                  </Button>
                  
                  <Button 
                    onClick={() => handleDemoLogin('admin', 'UniversityAdmin')}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    variant="default"
                  >
                    Demo as University Admin
                  </Button>
                  
                  <Button 
                    onClick={() => handleDemoLogin('admin', 'InstituteAdmin')}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    variant="default"
                  >
                    Demo as Institute Admin
                  </Button>
                  
                  <Button 
                    onClick={() => handleDemoLogin('admin', 'Faculty')}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                    variant="default"
                  >
                    Demo as Faculty
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="student">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student Login Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Student Login
                  </CardTitle>
                  <CardDescription>
                    Access your student dashboard and resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleLogin(e, 'student')} className="space-y-4">
                    <div>
                      <Label htmlFor="student-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="student-email"
                          type="email"
                          placeholder="student@university.edu"
                          value={credentials.email}
                          onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="student-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="student-password"
                          type="password"
                          placeholder="Enter your password"
                          value={credentials.password}
                          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Student Demo Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Demo Access</CardTitle>
                  <CardDescription>
                    Experience the student portal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert>
                    <AlertDescription>
                      Click the button below to experience the student dashboard.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={() => handleDemoLogin('student')}
                    className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
                    variant="default"
                  >
                    Demo as Student
                  </Button>

                  <div className="text-center mt-4">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account? Contact your institution administrator.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© 2024 Mann Mitra. University Registration Portal.</p>
          <p>Secure access to institutional resources and student management.</p>
        </div>
      </div>
    </div>
  );
}
