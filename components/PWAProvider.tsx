/**
 * Enhanced PWA Component - Mobile-First App Experience
 */

import { useState, useEffect, useRef } from 'react';
import { Download, X, Wifi, WifiOff } from '@/lib/icons';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>;
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Online/Offline Status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA Install Prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setIsInstallable(true);
      
      // Show install prompt after 10 seconds on mobile
      if (window.innerWidth < 768) {
        setTimeout(() => setShowInstallPrompt(true), 10000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt.current) return;

    deferredPrompt.current.prompt();
    const result = await deferredPrompt.current.userChoice;
    
    if (result.outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    deferredPrompt.current = null;
    setShowInstallPrompt(false);
    setIsInstallable(false);
  };

  return (
    <>
      {children}
      
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-16 left-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <WifiOff className="h-5 w-5" />
            <span className="text-sm font-medium">
              Offline-Modus - Einige Funktionen sind eingeschränkt
            </span>
          </div>
        </div>
      )}

      {/* Install App Prompt - Mobile optimiert */}
      {showInstallPrompt && isInstallable && !isStandalone && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-4 md:left-auto md:right-4 md:w-80">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">AG</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AlltagsGold App</h3>
                  <p className="text-sm text-gray-600">Für bessere Performance</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Installieren Sie unsere App für schnelleren Zugriff und Offline-Funktionen
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleInstallClick}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white h-10 text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Installieren
                </Button>
                <Button
                  onClick={() => setShowInstallPrompt(false)}
                  variant="outline"
                  className="px-3 h-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Online Status Restored */}
      {isOnline && (
        <div className="fixed top-16 left-4 right-4 z-50 bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded-lg shadow-lg transition-opacity duration-500 opacity-0 animate-fade-in">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            <span className="text-sm">Verbindung wiederhergestellt</span>
          </div>
        </div>
      )}
    </>
  );
}
