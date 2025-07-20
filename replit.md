# AlltagsGold Next.js E-Commerce Project

## Overview
This is a Next.js-based e-commerce website for AlltagsGold, a Swiss lifestyle products retailer. The project features a modern, responsive design with extensive Shopify integration, advanced analytics, and optimized performance for the Swiss market.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Framework & Technologies
- **Next.js 14+** with App Router architecture
- **TypeScript** for type safety
- **Tailwind CSS** with custom design system
- **React Query (TanStack)** for server state management
- **Radix UI** components for accessibility

### Frontend Architecture
The application follows a modern React component architecture with:
- **Pages Router**: Traditional Next.js pages structure (`/pages` directory)
- **Component-based architecture**: Reusable UI components in `/components`
- **Custom hooks**: Business logic abstraction in `/hooks`
- **Utility libraries**: Helper functions in `/lib`

### Backend Architecture
- **Serverless functions**: API routes handled by Next.js
- **External APIs**: Primary data source through Shopify Storefront API
- **Static data**: Cached JSON files for performance optimization

## Key Components

### E-Commerce Features
- **Shopify Integration**: Full storefront API integration for products, collections, and cart management
- **Shopping Cart**: Persistent cart with local storage and Shopify cart synchronization
- **Checkout Flow**: Direct integration with Shopify checkout system
- **Product Management**: Dynamic product pages with variant selection
- **Collection Pages**: Filtered and searchable product listings

### Content Management
- **Blog System**: Shopify-based blog with custom rendering
- **Static Pages**: Legal pages (AGB, Datenschutz, Impressum)
- **SEO Optimization**: Advanced meta tag management and canonical URLs

### User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Custom UI components built on Radix UI
- **Image Optimization**: Cloudinary integration for automatic image processing
- **Loading States**: Skeleton screens and loading indicators

## Data Flow

### Product Data
1. **Static Generation**: Products and collections cached in JSON files
2. **Client-side Hydration**: React Query manages dynamic updates
3. **Search & Filtering**: Client-side filtering with server-side fallbacks

### Cart Management
1. **Local State**: React hooks manage cart state
2. **Shopify Sync**: Cart operations synchronized with Shopify API
3. **Persistence**: LocalStorage maintains cart across sessions

### Analytics Integration
1. **Multi-platform Tracking**: Facebook Pixel, TikTok Pixel, Google Analytics
2. **E-commerce Events**: Purchase tracking, view content, add to cart
3. **Performance Monitoring**: Web Vitals and Core Web Vitals tracking

## External Dependencies

### Core Integrations
- **Shopify Storefront API**: Product catalog and cart management
- **Cloudinary**: Image optimization and delivery
- **SendGrid**: Email notifications (configured but not actively used)
- **Neon Database**: Database connection (prepared for future use)

### Analytics & Marketing
- **Meta Pixel**: Facebook advertising and conversion tracking
- **TikTok Pixel**: TikTok advertising integration
- **Google Tag Manager**: Universal analytics container
- **LinkedIn Insight Tag**: B2B marketing tracking

### Development Tools
- **ESLint & TypeScript**: Code quality and type checking
- **Tailwind CSS**: Utility-first styling
- **PostCSS**: CSS processing
- **React Query DevTools**: Development debugging

## Deployment Strategy

### Vercel Platform
- **Framework**: Next.js optimized deployment
- **Region**: Frankfurt (fra1) for Swiss market optimization
- **Build Process**: Automated builds on git push
- **Environment Variables**: Secure configuration management

### Performance Optimizations
- **Image Optimization**: Next.js Image component with Cloudinary
- **Static Generation**: Pre-built pages for faster loading
- **Bundle Splitting**: Automatic code splitting by Next.js
- **CDN Integration**: Global content delivery through Vercel

### Database Strategy
The application currently uses a hybrid approach:
- **Static JSON files** for cached product data and collections
- **Neon Database** connection prepared for future user data, orders, and analytics
- **Shopify as primary source** for real-time product and inventory data

### Security Features
- **HTTPS Enforced**: SSL certificates managed by Vercel
- **Content Security Policy**: Headers configured for XSS protection
- **Environment Variables**: Sensitive API keys secured
- **CORS Configuration**: Restricted to allowed domains

### Monitoring & Analytics
- **Web Vitals Tracking**: Performance metrics to multiple platforms
- **Error Tracking**: Console logging for development, analytics for production
- **A/B Testing Ready**: Analytics foundation supports conversion optimization
- **Swiss Market Focus**: German language content and CHF pricing throughout

The architecture supports the specific needs of a Swiss e-commerce business with multi-platform marketing, performance optimization, and seamless Shopify integration while maintaining flexibility for future database integration and feature expansion.