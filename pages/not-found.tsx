import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "@/lib/icons";
import { NextSEOHead } from '@/components/seo/NextSEOHead';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <NextSEOHead 
        seo={{
          title: 'Seite nicht gefunden - 404 | AlltagsGold',
          description: 'Die gesuchte Seite konnte nicht gefunden werden. Entdecken Sie stattdessen unsere Premium-Produktkategorien.',
          keywords: '404, Not Found, AlltagsGold'
  }}
  robots="noindex, nofollow"
      />
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 - Seite nicht gefunden</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600 mb-6">
            Die gesuchte Seite existiert nicht oder wurde verschoben.
          </p>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">Zur Startseite</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/collections">Alle Kategorien</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
