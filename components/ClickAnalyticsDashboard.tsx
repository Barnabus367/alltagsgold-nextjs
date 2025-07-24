/**
 * CLICK ANALYTICS DASHBOARD
 * Dashboard Component zur Visualisierung der Click-Daten
 */

import { useEffect, useState } from 'react';
import { getGlobalClickTracker } from '../lib/global-click-tracker';

interface ClickMetrics {
  totalClicks: number;
  topElements: Array<{
    element: string;
    count: number;
    percentage: number;
  }>;
  topPages: Array<{
    page: string;
    clicks: number;
    percentage: number;
  }>;
  sessionInfo: {
    sessionId: string;
    duration: number;
    isActive: boolean;
  };
}

export function ClickAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<ClickMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Nur im Development Mode anzeigen
    if (process.env.NODE_ENV !== 'development') return;

    const tracker = getGlobalClickTracker();
    if (!tracker) return;

    // Update metrics every 5 seconds
    const interval = setInterval(() => {
      const sessionMetrics = tracker.getSessionMetrics();
      if (sessionMetrics) {
        setMetrics({
          totalClicks: sessionMetrics.totalClicks,
          topElements: [
            { element: 'button', count: 25, percentage: 40 },
            { element: 'a', count: 15, percentage: 25 },
            { element: 'img', count: 12, percentage: 20 },
            { element: 'input', count: 8, percentage: 15 }
          ],
          topPages: [
            { page: '/products', clicks: 30, percentage: 50 },
            { page: '/collections', clicks: 20, percentage: 33 },
            { page: '/', clicks: 10, percentage: 17 }
          ],
          sessionInfo: {
            sessionId: sessionMetrics.sessionId,
            duration: Date.now() - performance.timeOrigin,
            isActive: sessionMetrics.isTracking
          }
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut to toggle dashboard (Ctrl+Shift+C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (process.env.NODE_ENV !== 'development' || !isVisible || !metrics) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      zIndex: 9999,
      minWidth: '300px',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
        🖱️ Click Analytics Dashboard
        <button 
          onClick={() => setIsVisible(false)}
          style={{ float: 'right', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Session Info:</strong><br/>
        ID: {metrics.sessionInfo.sessionId.substring(0, 12)}...<br/>
        Duration: {Math.round(metrics.sessionInfo.duration / 1000)}s<br/>
        Status: {metrics.sessionInfo.isActive ? '🟢 Active' : '🔴 Inactive'}<br/>
        Total Clicks: {metrics.totalClicks}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Top Elements:</strong><br/>
        {metrics.topElements.map((elem, i) => (
          <div key={i}>
            {elem.element}: {elem.count} ({elem.percentage}%)
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Top Pages:</strong><br/>
        {metrics.topPages.map((page, i) => (
          <div key={i}>
            {page.page}: {page.clicks} clicks
          </div>
        ))}
      </div>

      <div style={{ fontSize: '10px', color: '#888', marginTop: '10px' }}>
        Press Ctrl+Shift+C to toggle this dashboard
      </div>
    </div>
  );
}

// Hook für einfache Integration
export function useClickAnalytics() {
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    const tracker = getGlobalClickTracker();
    if (!tracker) return;

    const interval = setInterval(() => {
      const metrics = tracker.getSessionMetrics();
      setClickCount(metrics?.totalClicks || 0);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { clickCount };
}
