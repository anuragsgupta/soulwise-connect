import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, createContext, useContext } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import LoginPage from "./components/auth/LoginPage";
import StudentDashboard from "./components/dashboard/StudentDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Auth Context
const AuthContext = createContext<{
  user: { type: 'student' | 'admin' } | null;
  login: (userType: 'student' | 'admin') => void;
  logout: () => void;
} | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const App = () => {
  const [user, setUser] = useState<{ type: 'student' | 'admin' } | null>(null);

  const login = (userType: 'student' | 'admin') => {
    setUser({ type: userType });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthContext.Provider value={{ user, login, logout }}>
          <Router>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route 
                path="/login" 
                element={user ? <Navigate to={user.type === 'student' ? '/dashboard' : '/admin'} replace /> : <LoginPage onLogin={login} />} 
              />
              <Route 
                path="/dashboard" 
                element={user?.type === 'student' ? <StudentDashboard onLogout={logout} /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/admin" 
                element={user?.type === 'admin' ? <AdminDashboard onLogout={logout} /> : <Navigate to="/login" replace />} 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
