/**
 * PWA Integration Hook für AlltagsGold
 * Manages Service Worker, App Install, Offline Detection
 */

import { useState, useEffect } from 'react';

interface PWACapabilities {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  serviceWorkerReady: boolean;
  updateAvailable: boolean;
  canShare: boolean;
  hasNotificationPermission: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWA() {
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    isInstallable: false,
    isInstalled: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    serviceWorkerReady: false,
    updateAvailable: false,
    canShare: false,
    hasNotificationPermission: false
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if app is installed
    const checkInstallStatus = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone ||
                         document.referrer.includes('android-app://');
      
      setCapabilities(prev => ({ ...prev, isInstalled }));
    };

    // Online/Offline detection
    const handleOnlineStatus = () => {
      setCapabilities(prev => ({ ...prev, isOnline: navigator.onLine }));
    };

    // PWA Install Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCapabilities(prev => ({ ...prev, isInstallable: true }));
      
      console.log('📱 PWA install prompt available');
    };

    // Service Worker Registration
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          });

          console.log('✅ Service Worker registered:', registration.scope);
          
          setCapabilities(prev => ({ ...prev, serviceWorkerReady: true }));

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 New Service Worker available');
                  setCapabilities(prev => ({ ...prev, updateAvailable: true }));
                }
              });
            }
          });

          // Listen for controlling service worker change
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('🔄 Service Worker controller changed');
            window.location.reload();
          });

        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
        }
      }
    };

    // Check Web Share API support
    const checkWebShareSupport = () => {
      const canShare = 'share' in navigator;
      setCapabilities(prev => ({ ...prev, canShare }));
    };

    // Check Notification Permission
    const checkNotificationPermission = () => {
      if ('Notification' in window) {
        const hasPermission = Notification.permission === 'granted';
        setCapabilities(prev => ({ ...prev, hasNotificationPermission: hasPermission }));
      }
    };

    // Initialize
    checkInstallStatus();
    checkWebShareSupport();
    checkNotificationPermission();
    registerServiceWorker();

    // Event Listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Install PWA
  const installPWA = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.warn('PWA install prompt not available');
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      console.log('PWA install choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        setCapabilities(prev => ({ 
          ...prev, 
          isInstallable: false,
          isInstalled: true 
        }));
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('PWA install failed:', error);
      return false;
    }
  };

  // Update Service Worker
  const updateServiceWorker = async (): Promise<void> => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  };

  // Request Notification Permission
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      
      setCapabilities(prev => ({ ...prev, hasNotificationPermission: granted }));
      
      if (granted) {
        console.log('✅ Notification permission granted');
        await subscribeToPushNotifications();
      }
      
      return granted;
    } catch (error) {
      console.error('Notification permission failed:', error);
      return false;
    }
  };

  // Subscribe to Push Notifications
  const subscribeToPushNotifications = async (): Promise<void> => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY
      });

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      console.log('✅ Push notification subscription successful');
    } catch (error) {
      console.error('Push subscription failed:', error);
    }
  };

  // Share Content
  const shareContent = async (data: ShareData): Promise<boolean> => {
    if (!capabilities.canShare) {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(data.url || window.location.href);
        console.log('📋 Content copied to clipboard');
        return true;
      } catch (error) {
        console.error('Share/Copy failed:', error);
        return false;
      }
    }

    try {
      await navigator.share(data);
      console.log('📤 Content shared successfully');
      return true;
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Share failed:', error);
      }
      return false;
    }
  };

  // Add to Home Screen prompt
  const showAddToHomeScreen = () => {
    if (capabilities.isInstalled) {
      console.log('PWA already installed');
      return;
    }

    // Show custom install prompt
    const installBanner = document.createElement('div');
    installBanner.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: #059669;
        color: white;
        padding: 16px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      ">
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">App installieren</div>
          <div style="font-size: 14px; opacity: 0.9;">Für eine bessere Erfahrung</div>
        </div>
        <div>
          <button id="install-pwa" style="
            background: white;
            color: #059669;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 600;
            margin-right: 8px;
            cursor: pointer;
          ">Installieren</button>
          <button id="dismiss-install" style="
            background: transparent;
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
          ">Später</button>
        </div>
      </div>
    `;

    document.body.appendChild(installBanner);

    // Event Listeners
    document.getElementById('install-pwa')?.addEventListener('click', async () => {
      await installPWA();
      document.body.removeChild(installBanner);
    });

    document.getElementById('dismiss-install')?.addEventListener('click', () => {
      document.body.removeChild(installBanner);
    });

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (document.body.contains(installBanner)) {
        document.body.removeChild(installBanner);
      }
    }, 10000);
  };

  return {
    capabilities,
    installPWA,
    updateServiceWorker,
    requestNotificationPermission,
    shareContent,
    showAddToHomeScreen
  };
}

// Offline Storage Hook
export function useOfflineStorage() {
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOfflineMode(true);
    const handleOnline = () => setIsOfflineMode(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const saveOfflineAction = async (action: any) => {
    if (typeof window === 'undefined') return;

    try {
      const db = await openIndexedDB();
      const transaction = db.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      
      await store.add({
        ...action,
        timestamp: Date.now(),
        synced: false
      });

      console.log('💾 Offline action saved:', action.type);
      
      // Register background sync
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if ('sync' in (registration as any)) {
          await (registration as any).sync.register('cart-sync');
        }
      }
    } catch (error) {
      console.error('Failed to save offline action:', error);
    }
  };

  const openIndexedDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('alltagsgold-offline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('offlineActions')) {
          const store = db.createObjectStore('offlineActions', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  };

  return {
    isOfflineMode,
    saveOfflineAction
  };
}

export type { PWACapabilities, BeforeInstallPromptEvent };
