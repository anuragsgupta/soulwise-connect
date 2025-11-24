"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, X, Smartphone, Monitor } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has dismissed the prompt before
    const hasDismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = hasDismissed ? parseInt(hasDismissed) : 0;
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    
    // Don't show if dismissed within last 3 days
    if (Date.now() - dismissedTime < threeDaysInMs) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 10 seconds of user being on the site
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Will show again on next visit (not saving to localStorage)
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Download className="w-6 h-6 text-white" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogTitle className="text-xl">
            Install Mann Mitra App
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Get the full app experience with offline access, faster loading, and quick access from your home screen.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="flex items-start space-x-3 text-sm">
            <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Native App Experience</p>
              <p className="text-gray-600">Works like a native app on your phone or computer</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-sm">
            <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Offline Access</p>
              <p className="text-gray-600">Continue using even without internet connection</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-sm">
            <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Monitor className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Quick Access</p>
              <p className="text-gray-600">Launch directly from your home screen or desktop</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2 sm:gap-2">
          <Button
            onClick={handleInstallClick}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            Install Now
          </Button>
          <div className="flex gap-2 w-full">
            <Button
              onClick={handleRemindLater}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              Remind Me Later
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              className="flex-1"
              size="sm"
            >
              No Thanks
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
