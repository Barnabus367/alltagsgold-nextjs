import { useEffect } from 'react';

interface ReviewWidgetProps {
  platform?: 'trustpilot' | 'judgeme' | 'reviews.io';
  businessId?: string;
  displayType?: 'mini' | 'carousel' | 'grid';
}

export function ReviewWidget({ 
  platform = 'trustpilot',
  businessId = 'alltagsgold.ch',
  displayType = 'mini' 
}: ReviewWidgetProps) {
  
  useEffect(() => {
    // Placeholder für echte Integration
    // Die tatsächliche Integration erfordert API-Keys und Business-Verifizierung
    
    if (platform === 'trustpilot') {
      // Trustpilot Widget Integration
      // Beispiel: https://support.trustpilot.com/hc/en-us/articles/115011421468
      const script = document.createElement('script');
      script.src = '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
    
    // Weitere Plattformen können hier hinzugefügt werden
  }, [platform]);
  
  // Widget-Konfiguration basierend auf Plattform
  const widgetConfig = {
    trustpilot: {
      scriptUrl: '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js',
      templateId: displayType === 'mini' ? '5419b6a8b0d04a076446a9ad' : '54ad5defc6454f065c28af8b',
      height: displayType === 'mini' ? '24px' : '240px'
    },
    judgeme: {
      scriptUrl: 'https://cdn.judge.me/widget_preloader.js',
      shopDomain: 'alltagsgold.myshopify.com'
    },
    'reviews.io': {
      scriptUrl: 'https://widget.reviews.io/rating-snippet/dist.js',
      storeId: businessId
    }
  };
  
  // Show instructions only in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🌟 Bewertungen aktivieren (Development Only)
        </h3>
        
        <div className="space-y-4 text-sm">
          <p className="text-gray-700">
            Um echte Kundenbewertungen anzuzeigen, wählen Sie einen Anbieter:
          </p>
          
          <div className="grid gap-3">
            <div className="bg-white p-4 rounded border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Option 1: Trustpilot</h4>
              <ol className="text-gray-600 space-y-1 text-xs">
                <li>1. Registrieren Sie sich bei trustpilot.com/products/trustbox</li>
                <li>2. Verifizieren Sie Ihre Domain</li>
                <li>3. Kopieren Sie Ihre Business Unit ID</li>
                <li>4. Fügen Sie diese in die .env.local ein: NEXT_PUBLIC_TRUSTPILOT_ID=ihre-id</li>
              </ol>
            </div>
            
            <div className="bg-white p-4 rounded border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Option 2: Judge.me (Shopify)</h4>
              <ol className="text-gray-600 space-y-1 text-xs">
                <li>1. Installieren Sie Judge.me im Shopify App Store</li>
                <li>2. Konfigurieren Sie die App</li>
                <li>3. Die Integration erfolgt automatisch</li>
              </ol>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-800">
            <strong>Tipp:</strong> Judge.me integriert sich nahtlos mit Shopify und sammelt automatisch Bewertungen nach dem Kauf.
          </div>
        </div>
      </div>
    );
  }

  // In production, check if Trustpilot ID is configured
  const trustpilotId = process.env.NEXT_PUBLIC_TRUSTPILOT_ID;
  
  if (!trustpilotId) {
    // Return nothing in production if not configured
    return null;
  }

  // Return actual Trustpilot widget in production
  return (
    <div className="my-6">
      <div 
        className="trustpilot-widget" 
        data-locale="de-CH" 
        data-template-id={widgetConfig.trustpilot.templateId}
        data-businessunit-id={trustpilotId}
        data-style-height={widgetConfig.trustpilot.height}
        data-style-width="100%"
        data-theme="light"
      >
        <a href={`https://ch.trustpilot.com/review/${trustpilotId}`} target="_blank" rel="noopener">
          Trustpilot
        </a>
      </div>
    </div>
  );
}