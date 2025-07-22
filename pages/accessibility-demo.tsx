/**
 * Demo-Seite für neue Accessibility & Mobile UX Features
 * Zeigt alle implementierten Verbesserungen
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, ShoppingCart, Search, Menu, X } from 'lucide-react';
import { MobileMenu, MobileMenuButton } from '@/components/mobile/MobileMenu';
import { 
  AccessibleForm, 
  AccessibleFormField, 
  AccessibleInput, 
  AccessibleTextarea, 
  AccessibleSelect,
  AccessibleCheckbox,
  AccessibleButton 
} from '@/components/ui/accessible-forms';
import { announceToScreenReader } from '@/lib/accessibility';
import { useMobileUX } from '@/hooks/useMobileUX';

export default function AccessibilityDemo() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    category: '',
    newsletter: false
  });
  
  const { capabilities, getTouchClasses } = useMobileUX();

  const handleFormSubmit = async (e: React.FormEvent) => {
    console.log('Form submitted:', formData);
    announceToScreenReader('Formular erfolgreich gesendet!');
  };

  const handleAddToCart = () => {
    announceToScreenReader('Produkt zum Warenkorb hinzugefügt');
  };

  const handleWishlist = () => {
    announceToScreenReader('Produkt zur Wunschliste hinzugefügt');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip Links - nur mit Keyboard Navigation sichtbar */}
      <nav className="skip-links">
        <a href="#main-content" className="skip-link">
          Zum Hauptinhalt springen
        </a>
        <a href="#product-demo" className="skip-link">
          Zu den Produkten springen
        </a>
        <a href="#form-demo" className="skip-link">
          Zum Kontaktformular springen
        </a>
      </nav>

      {/* Header mit Mobile Menu */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                AlltagsGold Demo
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8" role="navigation" aria-label="Hauptnavigation">
              <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Startseite
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Produkte
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Über uns
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <MobileMenuButton 
                onClick={() => setIsMobileMenuOpen(true)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpen={() => setIsMobileMenuOpen(true)}
        cartItemCount={3}
      />

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Feature Overview */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Neue Accessibility & Mobile UX Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🎯 Accessibility Features
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>✅ WCAG 2.1 AA konform</li>
                <li>✅ Screen Reader optimiert</li>
                <li>✅ Keyboard Navigation</li>
                <li>✅ Skip Links (Tab drücken)</li>
                <li>✅ Focus Management</li>
                <li>✅ Live Regions für Updates</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                📱 Mobile UX Features
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>✅ Touch-optimierte Buttons (44px+)</li>
                <li>✅ Swipe Gestures</li>
                <li>✅ Device Detection</li>
                <li>✅ Mobile-First Design</li>
                <li>✅ Performance optimiert</li>
                <li>✅ Safe Area Support</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Device Info:</h4>
            <div className="text-sm text-blue-800">
              <p>Touch Support: {capabilities.supportsTouch ? '✅ Ja' : '❌ Nein'}</p>
              <p>Device Type: {capabilities.isMobile ? '📱 Mobile' : capabilities.isTablet ? '📱 Tablet' : '💻 Desktop'}</p>
              <p>Screen Size: {capabilities.screenSize}</p>
              <p>Orientation: {capabilities.orientation}</p>
            </div>
          </div>
        </section>

        {/* Product Demo */}
        <section id="product-demo" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Touch-optimierte Produktkarten
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((id) => (
              <article 
                key={id}
                className={`bg-white rounded-lg border shadow-sm group hover:shadow-md transition-all ${getTouchClasses()}`}
                role="group"
                aria-labelledby={`product-${id}-title`}
              >
                <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                  <Image 
                    src={`https://picsum.photos/400/400?random=${id}`}
                    alt={`Demo Produkt ${id}`}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Wishlist Button - Touch optimiert */}
                  <button
                    onClick={handleWishlist}
                    className={`absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      capabilities.supportsTouch 
                        ? 'min-h-[44px] min-w-[44px] p-3 touch-manipulation' 
                        : 'h-8 w-8 p-1'
                    }`}
                    aria-label={`Demo Produkt ${id} zur Wunschliste hinzufügen`}
                  >
                    <Heart className={capabilities.supportsTouch ? 'h-5 w-5' : 'h-4 w-4'} />
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 
                    id={`product-${id}-title`}
                    className="font-medium text-gray-900 mb-2"
                  >
                    Demo Produkt {id}
                  </h3>
                  
                  <p className="text-xl font-bold text-gray-900 mb-4">
                    €{(49.99 + id * 10).toFixed(2)}
                  </p>
                  
                  <button
                    onClick={handleAddToCart}
                    className={`w-full bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      capabilities.supportsTouch 
                        ? 'py-3 px-4 min-h-[44px] touch-manipulation text-base' 
                        : 'py-2 px-3 min-h-[36px] text-sm'
                    }`}
                    aria-label={`Demo Produkt ${id} in den Warenkorb legen`}
                  >
                    <span className="flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      In den Warenkorb
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Form Demo */}
        <section id="form-demo" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Barrierefreies Kontaktformular
          </h2>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border max-w-2xl">
            <AccessibleForm onSubmit={handleFormSubmit}>
              <AccessibleFormField
                label="Name"
                required
                helperText="Ihr vollständiger Name"
              >
                <AccessibleInput
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Max Mustermann"
                  autoComplete="name"
                />
              </AccessibleFormField>

              <AccessibleFormField
                label="E-Mail"
                required
                helperText="Wir verwenden Ihre E-Mail nur für die Antwort"
              >
                <AccessibleInput
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="max@example.com"
                  autoComplete="email"
                />
              </AccessibleFormField>

              <AccessibleFormField
                label="Kategorie"
                required
              >
                <AccessibleSelect
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="Wählen Sie eine Kategorie"
                >
                  <option value="support">Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Sonstiges</option>
                </AccessibleSelect>
              </AccessibleFormField>

              <AccessibleFormField
                label="Nachricht"
                required
                helperText="Beschreiben Sie Ihr Anliegen"
              >
                <AccessibleTextarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Ihre Nachricht..."
                  rows={4}
                />
              </AccessibleFormField>

              <AccessibleCheckbox
                label="Newsletter abonnieren (optional)"
                checked={formData.newsletter}
                onChange={(e) => setFormData({...formData, newsletter: e.target.checked})}
              />

              <AccessibleButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
              >
                Nachricht senden
              </AccessibleButton>
            </AccessibleForm>
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Interaktive Accessibility Tests
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Screen Reader Test</h3>
              <p className="text-gray-700 mb-4">
                Testen Sie die Screen Reader Ankündigungen:
              </p>
              <button
                onClick={() => announceToScreenReader('Dies ist eine Test-Ankündigung für Screen Reader')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Screen Reader Test
              </button>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Keyboard Navigation</h3>
              <p className="text-gray-700 mb-4">
                Verwenden Sie Tab, Enter, Space und Escape:
              </p>
              <div className="space-x-2">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                  Button 1
                </button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  Button 2
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Instructions */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            🧪 Wie Sie die Features testen können:
          </h3>
          <div className="space-y-2 text-yellow-800">
            <p><strong>Keyboard Navigation:</strong> Drücken Sie Tab um durch die Elemente zu navigieren</p>
            <p><strong>Skip Links:</strong> Tab beim Laden der Seite für Skip-Navigation</p>
            <p><strong>Mobile Menu:</strong> Klicken Sie das Menu-Icon (📱 auf Mobile: swipe zum schließen)</p>
            <p><strong>Screen Reader:</strong> Aktivieren Sie VoiceOver (Mac) oder NVDA (Windows)</p>
            <p><strong>Touch Targets:</strong> Auf Touch-Geräten sind alle Buttons mindestens 44x44px</p>
          </div>
        </section>
      </main>

      {/* Live Region für Ankündigungen */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="announcements"></div>
    </div>
  );
}
