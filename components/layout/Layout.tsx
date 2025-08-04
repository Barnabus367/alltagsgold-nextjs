import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { AddToCartOverlay } from '@/components/cart/AddToCartOverlay';
import { TrustBanner } from '@/components/common/TrustBanner';
import { useNavigationHandler } from '@/lib/navigation-handler';

interface LayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
  showTrustBanner?: boolean;
}

export function Layout({ children, onSearch = () => {}, showTrustBanner = true }: LayoutProps) {
  // Navigation Handler für Back-Button-Problem
  const { resetComponentState } = useNavigationHandler();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={onSearch} />
      {showTrustBanner && <TrustBanner />}
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartSidebar />
      <AddToCartOverlay />
    </div>
  );
}
