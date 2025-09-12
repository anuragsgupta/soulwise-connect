import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./components/auth/LoginPage";
import StudentDashboard from "./components/dashboard/StudentDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<{ type: 'student' | 'admin' } | null>(null);

  const handleLogin = (userType: 'student' | 'admin') => {
    setUser({ type: userType });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!user ? (
          <LoginPage onLogin={handleLogin} />
        ) : user.type === 'student' ? (
          <StudentDashboard onLogout={handleLogout} />
        ) : (
          <AdminDashboard onLogout={handleLogout} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
