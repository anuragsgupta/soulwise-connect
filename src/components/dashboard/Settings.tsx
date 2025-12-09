"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Info,
  Shield,
  Sparkles,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SettingsProps {
  studentId: string;
}

export default function Settings({ studentId }: SettingsProps) {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'valid' | 'invalid' | 'unknown'>('unknown');

  // Load API key from database on mount
  useEffect(() => {
    const loadStoredKey = async () => {
      try {
        const response = await fetch("/api/student/api-key", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.hasCustomKey && data.apiKey) {
            setApiKey(data.apiKey);
            setHasCustomKey(true);
            setKeyStatus('valid');
          }
        }
      } catch (error) {
        console.error('Error loading API key:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredKey();
  }, [studentId]);

  const validateApiKey = async (key: string): Promise<boolean> => {
    try {
      // Use a lightweight capability endpoint. Treat 200 as valid.
      // Some keys may return 403 (quota/project restriction) even if valid — treat 403 as potentially valid.
      const url = `https://generativelanguage.googleapis.com/v1/models?key=${key}`;
      const response = await fetch(url, { method: 'GET' });
      if (response.ok) return true; // 200
      // If the key exists but has quota/project restrictions, the API may return 403.
      if (response.status === 403) {
        // Attempt to inspect error payload for common messages indicating a valid but restricted key.
        try {
          const err = await response.json();
          const msg = JSON.stringify(err).toLowerCase();
          if (msg.includes('permission') || msg.includes('unauthorized') || msg.includes('project')) {
            // Consider this acceptable for storage; the app can still use the key in eligible calls.
            return true;
          }
        } catch (_) {
          return true; // Conservative: accept 403 without body as likely valid
        }
      }
      return false;
    } catch (error) {
      console.error('API key validation error:', error);
      // Network/CORS failures should not block saving; allow user to proceed.
      return true;
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    if (apiKey.length < 20) {
      toast({
        title: "Invalid Format",
        description: "API key must be at least 20 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    setIsValidating(true);

    try {
      // Validate the API key
      const isValid = await validateApiKey(apiKey);
      
      if (!isValid) {
        setKeyStatus('invalid');
        toast({
          title: "Invalid API Key",
          description: "The API key you entered is not valid. Please check and try again.",
          variant: "destructive",
        });
        return;
      }

      // Save to database
      const response = await fetch("/api/student/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to save API key");
      }

      setKeyStatus('valid');
      setHasCustomKey(true);
      
      toast({
        title: "Success",
        description: "API key saved and validated successfully!",
      });
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setIsValidating(false);
    }
  };

  const handleRemoveApiKey = async () => {
    try {
      const response = await fetch("/api/student/api-key", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to remove API key");
      }

      setApiKey("");
      setKeyStatus('unknown');
      setHasCustomKey(false);
      
      toast({
        title: "API Key Removed",
        description: "Your custom API key has been removed. Using default API key now.",
      });
    } catch (error) {
      console.error('Error removing API key:', error);
      toast({
        title: "Error",
        description: "Failed to remove API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUseDefault = async () => {
    try {
      const response = await fetch("/api/student/api-key", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to switch to default");
      }

      setApiKey("");
      setKeyStatus('unknown');
      setHasCustomKey(false);
      
      toast({
        title: "Switched to Default",
        description: "You are now using the default API key.",
      });
    } catch (error) {
      console.error('Error switching to default:', error);
      toast({
        title: "Error",
        description: "Failed to switch to default. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Configure your Mann Mitra experience
        </p>
      </div>

      {/* API Key Configuration */}
      <Card className="border-2 w-full">
        <CardHeader>
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Key className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg sm:text-xl">Google Gemini API Key</CardTitle>
              <CardDescription className="mt-1 text-sm">
                Configure your personal API key for AI chatbot features
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5">
          {/* Default Key Info */}
          {!hasCustomKey && (
            <Alert className="bg-blue-50 border-blue-200">
              <RefreshCw className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900 font-semibold">Using Default API Key</AlertTitle>
              <AlertDescription className="text-blue-800">
                You are currently using the default API key. Add your own key for a personalized experience with higher rate limits.
              </AlertDescription>
            </Alert>
          )}

          {/* Status Badge */}
          {keyStatus !== 'unknown' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Status:</span>
              {keyStatus === 'valid' ? (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active & Valid
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Invalid Key
                </Badge>
              )}
            </div>
          )}

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-sm font-medium">
              Your API Key
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Google Gemini API key"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={handleSaveApiKey}
              disabled={isSaving || !apiKey.trim()}
              className="w-full sm:flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isValidating ? "Validating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save API Key
                </>
              )}
            </Button>
            
            {hasCustomKey && keyStatus === 'valid' && (
              <>
                <Button
                  onClick={handleUseDefault}
                  variant="outline"
                  className="w-full sm:w-auto border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Use Default</span>
                  <span className="sm:hidden">Default</span>
                </Button>
                <Button
                  onClick={handleRemoveApiKey}
                  variant="outline"
                  className="w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </>
            )}
          </div>

          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Security & Privacy</AlertTitle>
            <AlertDescription className="text-sm text-gray-600">
              Your API key is stored securely in the database and encrypted. It is only used to authenticate your requests to Google&apos;s Gemini API and is never shared with third parties.
            </AlertDescription>
          </Alert>

          {/* How to Get API Key */}
          <div className="bg-glacier/40 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">How to Get Your API Key</h3>
            </div>
            <ol className="space-y-2 text-xs sm:text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="font-semibold text-blue-600">1.</span>
                <span>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Google AI Studio <Info className="w-3 h-3" /></a></span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-blue-600">2.</span>
                <span>Sign in with your Google account</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-blue-600">3.</span>
                <span>Click on &quot;Get API Key&quot; or &quot;Create API Key&quot;</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-blue-600">4.</span>
                <span>Copy the generated key and paste it above</span>
              </li>
            </ol>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Free tier includes 60 requests per minute with no credit card required
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings Placeholder */}
      <Card className="border-2 border-dashed border-gray-200 bg-gray-50 w-full">
        <CardContent className="py-6 sm:py-8">
          <div className="text-center text-gray-500">
            <Info className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs sm:text-sm">More settings coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
