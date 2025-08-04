import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from '@/lib/icons';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generiere eindeutige Error-ID für Tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Error Logging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Custom Error Handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Analytics tracking (falls verfügbar)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false,
        error_id: this.state.errorId
      });
    }

    // Sentry oder anderen Error-Service aufrufen
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Hier würde normalerweise Sentry, LogRocket, etc. aufgerufen
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId,
      retryCount: this.retryCount
    };

    // Mock API call - in production würde das an einen Error-Service gehen
    console.log('Error Report:', errorReport);
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    }
  };

  private renderErrorUI() {
    const { level = 'component' } = this.props;
    const { error, errorId } = this.state;

    // Verschiedene Error-UIs je nach Level
    switch (level) {
      case 'critical':
        return this.renderCriticalError();
      case 'page':
        return this.renderPageError();
      default:
        return this.renderComponentError();
    }
  }

  private renderCriticalError() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Kritischer Fehler
          </h1>
          <p className="text-gray-600 mb-6">
            Die Anwendung konnte nicht geladen werden. Bitte versuchen Sie es später erneut.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Seite neu laden
            </button>
            <Link 
              href="/"
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Zur Startseite
            </Link>
          </div>
          {this.state.errorId && (
            <p className="mt-4 text-xs text-gray-500">
              Fehler-ID: {this.state.errorId}
            </p>
          )}
        </div>
      </div>
    );
  }

  private renderPageError() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-lg w-full bg-white rounded-lg shadow p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            Seite konnte nicht geladen werden
          </h1>
          <p className="text-gray-600 mb-6">
            Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
          </p>
          <div className="flex gap-3 justify-center">
            {this.retryCount < this.maxRetries && (
              <button
                onClick={this.handleRetry}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Erneut versuchen ({this.maxRetries - this.retryCount} verbleibend)
              </button>
            )}
            <button
              onClick={() => window.history.back()}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </button>
          </div>
        </div>
      </div>
    );
  }

  private renderComponentError() {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Komponente konnte nicht geladen werden
            </h3>
            <p className="mt-1 text-sm text-red-700">
              Ein Fehler ist in dieser Komponente aufgetreten.
            </p>
            {this.retryCount < this.maxRetries && (
              <div className="mt-3">
                <button
                  onClick={this.handleRetry}
                  className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 transition-colors"
                >
                  Erneut versuchen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      // Custom Fallback falls provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

// Convenience Components für verschiedene Use Cases
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="page">{children}</ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <ErrorBoundary level="component" fallback={fallback}>
    {children}
  </ErrorBoundary>
);

export const CriticalErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="critical">{children}</ErrorBoundary>
);

// Hook für funktionale Komponenten
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: string) => {
    console.error('Manual error report:', error, errorInfo);
    
    // Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  };

  return { handleError };
};
