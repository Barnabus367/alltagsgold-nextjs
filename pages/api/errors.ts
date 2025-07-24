/**
 * API Error Handler für alltagsgold.ch - Production Ready
 * Erstellt sichere API Route für Error Reporting
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ErrorReport } from '@/lib/error-service';

// Rate limiting storage (in production würde Redis/Database verwendet)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface ApiErrorResponse {
  success: boolean;
  errorId?: string;
  message?: string;
}

// Helper functions
function getClientIP(req: NextApiRequest): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
         req.connection.remoteAddress || 
         'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const key = `error_report_${ip}`;
  const limit = rateLimitStore.get(key);

  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return false;
  }

  if (limit.count >= 10) { // Max 10 error reports per minute per IP
    return true;
  }

  limit.count++;
  return false;
}

function sanitizeErrorReport(report: any): Partial<ErrorReport> {
  return {
    error: {
      message: String(report.error?.message || '').substring(0, 500),
      stack: String(report.error?.stack || '').substring(0, 2000),
      name: String(report.error?.name || 'Error')
    },
    context: {
      route: String(report.context?.route || '').substring(0, 200),
      userAgent: String(report.context?.userAgent || '').substring(0, 500),
      timestamp: report.context?.timestamp || new Date().toISOString(),
      sessionId: String(report.context?.sessionId || '').substring(0, 100),
      buildVersion: String(report.context?.buildVersion || '').substring(0, 50)
    },
    severity: ['low', 'medium', 'high', 'critical'].includes(report.severity) 
      ? report.severity 
      : 'medium',
    category: ['network', 'validation', 'shopify', 'runtime', 'ui', 'checkout'].includes(report.category)
      ? report.category
      : 'runtime',
    metadata: report.metadata ? JSON.parse(JSON.stringify(report.metadata)) : undefined
  };
}

async function processErrorReport(report: Partial<ErrorReport>): Promise<string> {
  const errorId = `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // In production: Send to external error service
    if (process.env.NODE_ENV === 'production') {
      // Sentry example:
      // Sentry.captureException(new Error(report.error.message), {
      //   tags: { category: report.category, severity: report.severity },
      //   extra: { context: report.context, metadata: report.metadata }
      // });
      
      // LogRocket example:
      // LogRocket.captureException(new Error(report.error.message));
      
      // Custom analytics
      if (process.env.ANALYTICS_WEBHOOK_URL) {
        await fetch(process.env.ANALYTICS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...report, errorId }),
          signal: AbortSignal.timeout(5000)
        });
      }
    }

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 API Error Report [${report.severity?.toUpperCase()}]`);
      console.error('Error:', report.error?.message);
      console.log('Category:', report.category);
      console.log('Context:', report.context);
      console.log('Error ID:', errorId);
      console.groupEnd();
    }

    return errorId;
  } catch (processingError) {
    console.error('Error processing error report:', processingError);
    return errorId; // Return ID even if processing fails
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiErrorResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    if (isRateLimited(clientIP)) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded'
      });
    }

    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body'
      });
    }

    // Sanitize and validate error report
    const sanitizedReport = sanitizeErrorReport(req.body);
    
    if (!sanitizedReport.error?.message) {
      return res.status(400).json({
        success: false,
        message: 'Error message is required'
      });
    }

    // Process the error report
    const errorId = await processErrorReport(sanitizedReport);

    // Return success response
    res.status(200).json({
      success: true,
      errorId,
      message: 'Error reported successfully'
    });

  } catch (error) {
    console.error('API Error handler failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Export rate limiting utilities for testing
export { isRateLimited, sanitizeErrorReport };
