import { Html, Head, Main, NextScript } from 'next/document'
import Image from 'next/image';
import { fontVariables } from '../lib/fonts-optimized'

export default function Document() {
  return (
    <Html lang="de">
      <Head>
        {/* PWA Manifest - Mit Fallback */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="alternate" href="/api/manifest" type="application/manifest+json" />
        <meta name="theme-color" content="#059669" />
        <meta name="application-name" content="AlltagsGold" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AlltagsGold" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#059669" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        
        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        
        {/* Critical CSS Variables */}
        <style dangerouslySetInnerHTML={{ __html: fontVariables }} />

        {/* Emergency Production Fix */}
        <script async src="/emergency-fix.js" type="text/javascript"></script>

        {/* Meta Pixel noscript fallback - Only in production */}
        {process.env.NODE_ENV === 'production' && (
          <noscript>
            <Image
              src="https://www.facebook.com/tr?id=1408203506889853&ev=PageView&noscript=1"
              alt="Facebook Pixel"
              width={1}
              height={1}
              style={{ display: 'none' }}
            />
          </noscript>
        )}


      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}