import React from 'react';
import Image from 'next/image';
import Head from 'next/head';

export default function ImageTest() {
  const testImages = [
    {
      name: 'Original Shopify URL',
      url: 'https://cdn.shopify.com/s/files/1/0918/4575/5223/files/913340162679.jpg?v=1750055469'
    },
    {
      name: 'Cloudinary Fetch (Shopify)',
      url: 'https://res.cloudinary.com/do7yh4dll/image/fetch/w_400,h_300,c_fill,q_auto,f_webp/https://cdn.shopify.com/s/files/1/0918/4575/5223/files/913340162679.jpg?v=1750055469'
    },
    {
      name: 'Current Fallback (Unsplash)',
      url: 'https://res.cloudinary.com/do7yh4dll/image/fetch/c_pad,w_400,h_300,b_auto/https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'
    }
  ];

  return (
    <>
      <Head>
        <title>Alltagsgold - Image Test Debug</title>
      </Head>
      
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">🖼️ Image Display Test</h1>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testImages.map((img, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src={img.url}
                    alt={img.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{img.name}</h3>
                  <p className="text-sm text-gray-600 break-words">{img.url}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Debug Information</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
              <p><strong>Cloudinary Cloud:</strong> do7yh4dll</p>
              <p><strong>Next.js Image Config:</strong> Optimized with remotePatterns</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
