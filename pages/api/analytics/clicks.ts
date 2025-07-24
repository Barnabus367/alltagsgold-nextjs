/**
 * API Endpoint für Click Analytics Data
 * /api/analytics/clicks
 */

import type { NextApiRequest, NextApiResponse } from 'next';

interface ClickData {
  element: string;
  text?: string;
  href?: string;
  className?: string;
  id?: string;
  position: { x: number; y: number };
  page: string;
  timestamp: number;
  userAgent: string;
  sessionId: string;
}

interface ClickAnalyticsResponse {
  success: boolean;
  data?: {
    totalClicks: number;
    uniqueSessions: number;
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
    heatmapData: Array<{
      x: number;
      y: number;
      intensity: number;
    }>;
  };
  error?: string;
}

// In-Memory Store (für Produktion würde man eine Datenbank verwenden)
const clickStore: ClickData[] = [];
const SESSION_STORE = new Set<string>();

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClickAnalyticsResponse>
) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    // Store incoming click data
    try {
      const clickData: ClickData = req.body;
      
      // Validate required fields
      if (!clickData.element || !clickData.page || !clickData.sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Add to store
      clickStore.push(clickData);
      SESSION_STORE.add(clickData.sessionId);

      // Keep only last 1000 clicks to prevent memory issues
      if (clickStore.length > 1000) {
        clickStore.shift();
      }

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to store click data'
      });
    }
  } else if (req.method === 'GET') {
    // Return analytics data
    try {
      const totalClicks = clickStore.length;
      const uniqueSessions = SESSION_STORE.size;

      // Calculate top elements
      const elementCounts: Record<string, number> = {};
      clickStore.forEach(click => {
        elementCounts[click.element] = (elementCounts[click.element] || 0) + 1;
      });

      const topElements = Object.entries(elementCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([element, count]) => ({
          element,
          count,
          percentage: Math.round((count / totalClicks) * 100)
        }));

      // Calculate top pages
      const pageCounts: Record<string, number> = {};
      clickStore.forEach(click => {
        pageCounts[click.page] = (pageCounts[click.page] || 0) + 1;
      });

      const topPages = Object.entries(pageCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([page, clicks]) => ({
          page,
          clicks,
          percentage: Math.round((clicks / totalClicks) * 100)
        }));

      // Generate heatmap data (simplified)
      const heatmapData = clickStore
        .filter(click => click.position)
        .reduce((acc: Array<{x: number, y: number, intensity: number}>, click) => {
          const existing = acc.find(point => 
            Math.abs(point.x - click.position.x) < 50 && 
            Math.abs(point.y - click.position.y) < 50
          );
          
          if (existing) {
            existing.intensity += 1;
          } else {
            acc.push({
              x: click.position.x,
              y: click.position.y,
              intensity: 1
            });
          }
          
          return acc;
        }, [])
        .sort((a, b) => b.intensity - a.intensity)
        .slice(0, 20); // Top 20 hotspots

      res.status(200).json({
        success: true,
        data: {
          totalClicks,
          uniqueSessions,
          topElements,
          topPages,
          heatmapData
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate analytics'
      });
    }
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
}
