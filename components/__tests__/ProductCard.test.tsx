import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from '../product/ProductCard'
import { ShopifyProduct } from '@/types/shopify'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock product data
const mockProduct: ShopifyProduct = {
  id: 'gid://shopify/Product/1',
  title: 'Test Product',
  handle: 'test-product',
  description: 'This is a test product',
  descriptionHtml: '<p>This is a test product</p>',
  images: {
    edges: [
      {
        node: {
          url: 'https://cdn.shopify.com/test-image.jpg',
          altText: 'Test product image'
        }
      }
    ]
  },
  variants: {
    edges: [
      {
        node: {
          id: 'gid://shopify/ProductVariant/1',
          title: 'Default',
          availableForSale: true,
          price: {
            amount: '29.99',
            currencyCode: 'CHF'
          },
          compareAtPrice: {
            amount: '39.99',
            currencyCode: 'CHF'
          },
          selectedOptions: []
        }
      }
    ]
  },
  priceRange: {
    minVariantPrice: {
      amount: '29.99',
      currencyCode: 'CHF'
    },
    maxVariantPrice: {
      amount: '29.99',
      currencyCode: 'CHF'
    }
  },
  collections: {
    edges: []
  },
  tags: [],
  vendor: 'Test Vendor',
  productType: 'Test Type',
  metafields: []
}

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />, { wrapper: createWrapper() })
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('CHF 29.99')).toBeInTheDocument()
    expect(screen.getByText('CHF 39.99')).toBeInTheDocument()
  })

  it('displays image with correct alt text', () => {
    render(<ProductCard product={mockProduct} />, { wrapper: createWrapper() })
    
    const image = screen.getByAltText('Test product image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', expect.stringContaining('test-image.jpg'))
  })

  it('shows discount badge when compareAtPrice exists', () => {
    render(<ProductCard product={mockProduct} />, { wrapper: createWrapper() })
    
    const discountBadge = screen.getByText('-25%')
    expect(discountBadge).toBeInTheDocument()
  })

  it('handles click events', () => {
    const mockPush = jest.fn()
    jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => ({
      push: mockPush,
      pathname: '/',
    }))

    render(<ProductCard product={mockProduct} />, { wrapper: createWrapper() })
    
    const card = screen.getByRole('article')
    fireEvent.click(card)
    
    expect(mockPush).toHaveBeenCalledWith('/products/test-product')
  })

  it('handles products without images gracefully', () => {
    const productWithoutImages = {
      ...mockProduct,
      images: { edges: [] }
    }
    
    render(<ProductCard product={productWithoutImages} />, { wrapper: createWrapper() })
    
    const placeholder = screen.getByAltText(expect.stringContaining('Test Product'))
    expect(placeholder).toBeInTheDocument()
  })

  it('displays "Ausverkauft" when not available', () => {
    const soldOutProduct = {
      ...mockProduct,
      variants: {
        edges: [
          {
            node: {
              ...mockProduct.variants.edges[0].node,
              availableForSale: false
            }
          }
        ]
      }
    }
    
    render(<ProductCard product={soldOutProduct} />, { wrapper: createWrapper() })
    
    expect(screen.getByText('Ausverkauft')).toBeInTheDocument()
  })
})