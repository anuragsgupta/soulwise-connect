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
import { useAuth } from '@/contexts/AuthContext';
import { Brain, Mail, Lock, Users, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({
    email: '',
    password: '',
  });
  const [studentCredentials, setStudentCredentials] = useState({
    rollNumber: '',
    password: '',
  });
  const { toast } = useToast();
  const { login } = useAuth();
  const router = useRouter();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(adminCredentials.email, adminCredentials.password);

      if (success) {
        toast({
          title: 'Welcome!',
          description: 'Login successful. Redirecting to your dashboard...',
        });
        router.push('/dashboard');
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'An error occurred during login',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login('', studentCredentials.password, studentCredentials.rollNumber);

      if (success) {
        toast({
          title: 'Welcome!',
          description: 'Login successful. Redirecting to your dashboard...',
        });
        router.push('/dashboard');
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid roll number or password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'An error occurred during login',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoStudentLogin = () => {
    setIsLoading(true);
    
    // Create demo student user data
    const demoUser = {
      id: 'demo-student-123',
      name: 'Demo Student',
      email: 'demo.student@university.edu',
      rollNumber: 'DEMO2024',
      userType: 'STUDENT' as const,
      isDemo: true
    };
    
    const demoToken = 'demo-token-' + Date.now();
    
    // Store in localStorage with correct keys for AuthContext
    localStorage.setItem('auth-token', demoToken);
    localStorage.setItem('auth-user', JSON.stringify(demoUser));
    
    // Also trigger the auth context login (will use stored data)
    toast({
      title: '🎓 Welcome Demo Student!',
      description: 'Exploring the student portal with demo credentials...',
    });
    
    // Reload to trigger AuthContext useEffect
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 500);
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
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="admin-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="admin@university.edu"
                          value={adminCredentials.email}
                          onChange={(e) => setAdminCredentials(prev => ({ ...prev, email: e.target.value }))}
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
                          value={adminCredentials.password}
                          onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <div className="text-center">
                      <Button 
                        type="button"
                        variant="link" 
                        onClick={() => router.push('/register')}
                        className="text-sm"
                      >
                        Don't have an account? Register here
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Admin Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Administrator Access</CardTitle>
                  <CardDescription>
                    Different admin levels have different capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert>
                    <AlertDescription>
                      Sign in with your institutional email and password to access your dashboard.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2 text-sm">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="font-semibold text-red-700">Super Admin</p>
                      <p className="text-red-600">Full system access and university management</p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-semibold text-blue-700">University Admin</p>
                      <p className="text-blue-600">Manage institutes and university-wide settings</p>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="font-semibold text-green-700">Institute Admin</p>
                      <p className="text-green-600">Manage students, faculty, and courses</p>
                    </div>
                    
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="font-semibold text-purple-700">Faculty</p>
                      <p className="text-purple-600">Access courses and student interactions</p>
                    </div>
                  </div>
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
                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="student-roll">Roll Number</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="student-roll"
                          type="text"
                          placeholder="Enter your roll number"
                          value={studentCredentials.rollNumber}
                          onChange={(e) => setStudentCredentials(prev => ({ ...prev, rollNumber: e.target.value }))}
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
                          value={studentCredentials.password}
                          onChange={(e) => setStudentCredentials(prev => ({ ...prev, password: e.target.value }))}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-full border-dashed border-2 border-primary/50 hover:bg-primary/10"
                      onClick={handleDemoStudentLogin}
                      disabled={isLoading}
                    >
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Try Demo Student Account
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Student Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Portal</CardTitle>
                  <CardDescription>
                    Access your academic resources
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert>
                    <AlertDescription>
                      Use your roll number and password to access the student portal.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert className="bg-blue-50 border-blue-200">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <span className="font-semibold">Demo Mode Available!</span>
                      <br />
                      Try the student portal with a demo account while authentication is being set up.
                    </AlertDescription>
                  </Alert>

                  <div className="text-center mt-4">
                    <p className="text-sm text-muted-foreground">
                      Don&apos;t have an account? Contact your institution administrator.
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
