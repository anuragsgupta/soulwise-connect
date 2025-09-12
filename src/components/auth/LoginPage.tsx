import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Brain, Shield, Users } from "lucide-react";

interface LoginPageProps {
  onLogin: (userType: 'student' | 'admin') => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    college: '',
    year: '' 
  });

  const handleLogin = (userType: 'student' | 'admin') => {
    // Mock authentication - in real app would validate credentials
    onLogin(userType);
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
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="student@college.edu"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={() => handleLogin('student')} 
                  className="w-full bg-gradient-to-r from-primary to-wellness hover:from-primary/90 hover:to-wellness/90 transition-all duration-300"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Sign in as Student
                </Button>
                <Button 
                  onClick={() => handleLogin('admin')} 
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Access
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  placeholder="Your Name"
                  value={signupData.name}
                  onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="student@college.edu"
                  value={signupData.email}
                  onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-college">College/University</Label>
                <Input
                  id="signup-college"
                  placeholder="Your Institution"
                  value={signupData.college}
                  onChange={(e) => setSignupData({...signupData, college: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-year">Academic Year</Label>
                <Input
                  id="signup-year"
                  placeholder="1st Year, 2nd Year, etc."
                  value={signupData.year}
                  onChange={(e) => setSignupData({...signupData, year: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                />
              </div>
              <Button 
                onClick={() => handleLogin('student')} 
                className="w-full bg-gradient-to-r from-wellness to-support hover:from-wellness/90 hover:to-support/90 transition-all duration-300"
              >
                <Brain className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground">
            Your mental health matters. Let's take this journey together. 💚
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;