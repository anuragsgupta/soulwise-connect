'use client';

import { useAuth } from "@/contexts/AuthContext";
import { RefreshCw } from "lucide-react";

export default function AuthLoadingWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-wellness-light/20 to-support-light/20">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-wellness rounded-full flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading...</h2>
          <p className="text-sm text-gray-500">Verifying your session</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
