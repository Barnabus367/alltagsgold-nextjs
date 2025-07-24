import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { AddToCartOverlay } from '@/components/cart/AddToCartOverlay';
import { useNavigationHandler } from '@/lib/navigation-handler';

interface LayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
}

export function Layout({ children, onSearch = () => {} }: LayoutProps) {
  // Navigation Handler für Back-Button-Problem
  const { resetComponentState } = useNavigationHandler();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={onSearch} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartSidebar />
      <AddToCartOverlay />
    </div>
  );
}
