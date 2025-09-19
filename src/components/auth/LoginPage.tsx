"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Brain, Shield, Users } from "lucide-react";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    college: '',
    year: '' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (userType: 'student' | 'admin') => {
    if (!loginData.email || !loginData.password) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    // Mock authentication - in real app would validate credentials
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    // Store user data in localStorage for demo
    localStorage.setItem('user', JSON.stringify({
      email: loginData.email,
      userType: userType
    }));
    
    router.push('/dashboard');
    setIsLoading(false);
  };

  const handleSignup = async (userType: 'student' | 'admin') => {
    if (!signupData.email || !signupData.password || !signupData.name) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    // Mock signup - in real app would create account
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    // Store user data in localStorage for demo
    localStorage.setItem('user', JSON.stringify({
      email: signupData.email,
      userType: userType,
      name: signupData.name
    }));
    
    router.push('/dashboard');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-support-light to-wellness-light flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23cbd5e1' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm shadow-2xl border-0 relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-wellness rounded-full flex items-center justify-center animate-float">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-wellness bg-clip-text text-transparent">
              MANN MITRA
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Your Digital Mental Health Companion
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@college.edu"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  onClick={() => handleLogin('student')}
                  disabled={isLoading}
                >
                  <Brain className="w-4 h-4" />
                  {isLoading ? "Signing in..." : "Student"}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 border-wellness text-wellness hover:bg-wellness hover:text-wellness-foreground transition-all duration-300"
                  onClick={() => handleLogin('admin')}
                  disabled={isLoading}
                >
                  <Shield className="w-4 h-4" />
                  {isLoading ? "Signing in..." : "Admin"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  value={signupData.name}
                  onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@college.edu"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="college">College/University</Label>
                <Input
                  id="college"
                  value={signupData.college}
                  onChange={(e) => setSignupData(prev => ({ ...prev, college: e.target.value }))}
                  placeholder="Your institution"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Academic Year</Label>
                <Input
                  id="year"
                  value={signupData.year}
                  onChange={(e) => setSignupData(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="e.g., 2nd Year, Final Year"
                  disabled={isLoading}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  onClick={() => handleSignup('student')}
                  disabled={isLoading}
                >
                  <Brain className="w-4 h-4" />
                  {isLoading ? "Creating..." : "Student"}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 border-wellness text-wellness hover:bg-wellness hover:text-wellness-foreground transition-all duration-300"
                  onClick={() => handleSignup('admin')}
                  disabled={isLoading}
                >
                  <Shield className="w-4 h-4" />
                  {isLoading ? "Creating..." : "Admin"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground w-full">
            Your mental health matters. Let's take this journey together. 💚
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
