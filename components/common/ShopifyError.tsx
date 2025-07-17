import { AlertTriangle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ShopifyErrorProps {
  error: string;
}

export function ShopifyError({ error }: ShopifyErrorProps) {
  const isConfigError = error === 'SHOPIFY_CONFIG_MISSING';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Shopify Integration Fehler</AlertTitle>
          <AlertDescription className="mt-2">
            {isConfigError ? (
              <>
                Die Shopify-Konfiguration ist unvollständig. 
                Der Storefront Access Token wird benötigt, um Produktdaten zu laden.
              </>
            ) : (
              <>
                Fehler beim Laden der Shopify-Daten: {error}
              </>
            )}
          </AlertDescription>
        </Alert>

        {isConfigError && (
          <div className="bg-muted p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Konfiguration erforderlich</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Um die vollständige Shop-Funktionalität zu nutzen, muss der 
              <code className="bg-background px-2 py-1 rounded text-xs mx-1">
                VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN
              </code>
              konfiguriert werden.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Schritte zur Konfiguration:</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Shopify Admin → Apps → App-Entwicklung</li>
                <li>Private App erstellen oder bearbeiten</li>
                <li>Storefront API Berechtigung aktivieren</li>
                <li>Access Token kopieren und als Umgebungsvariable setzen</li>
              </ol>
            </div>
          </div>
        )}

        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="w-full mt-4"
        >
          Seite neu laden
        </Button>
      </div>
    </div>
  );
}