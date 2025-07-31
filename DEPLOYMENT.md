# Deployment Guide

## Vercel Deployment

### Required Environment Variables

The following environment variables MUST be set in Vercel:

```
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token
```

### Optional Environment Variables

```
CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Node.js Version

This project requires Node.js 18.17.0 or higher.

### Build Configuration

- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Common Issues

1. **Environment Variables**: Make sure all required environment variables are set in Vercel project settings
2. **Node Version**: Ensure Vercel is using Node.js 18+
3. **API Routes**: Check that Shopify API is accessible from Vercel's servers

### Monitoring

After deployment, check:
- `/robots.txt` - Should be accessible
- `/sitemap.xml` - Should show sitemap index
- `/api/health` - Should return 200 OK