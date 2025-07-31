import {
  isValidPrice,
  isValidImage,
  isValidVariant,
  hasValidPrimaryVariant,
  isValidProduct,
  isValidCollection,
  sanitizeProduct,
  sanitizeCollection
} from '../type-guards'
import { ShopifyProduct, ShopifyCollection } from '@/types/shopify'

describe('Type Guards', () => {
  describe('isValidPrice', () => {
    it('returns true for valid prices', () => {
      expect(isValidPrice({ amount: '10.99', currencyCode: 'CHF' })).toBe(true)
      expect(isValidPrice({ amount: '0', currencyCode: 'USD' })).toBe(true)
      expect(isValidPrice({ amount: '999999.99', currencyCode: 'EUR' })).toBe(true)
    })

    it('returns false for invalid prices', () => {
      expect(isValidPrice(null)).toBe(false)
      expect(isValidPrice(undefined)).toBe(false)
      expect(isValidPrice({ amount: '-10', currencyCode: 'CHF' })).toBe(false)
      expect(isValidPrice({ amount: 'abc', currencyCode: 'CHF' })).toBe(false)
      expect(isValidPrice({ amount: '10', currencyCode: '' })).toBe(false)
    })
  })

  describe('isValidImage', () => {
    it('returns true for valid images', () => {
      expect(isValidImage({
        url: 'https://cdn.shopify.com/image.jpg',
        altText: 'Product image'
      })).toBe(true)
    })

    it('returns false for invalid images', () => {
      expect(isValidImage(null)).toBe(false)
      expect(isValidImage({ url: '', altText: 'Alt' })).toBe(false)
      expect(isValidImage({ url: 'not-a-url', altText: 'Alt' })).toBe(false)
    })
  })

  describe('isValidVariant', () => {
    const validVariant = {
      id: 'gid://shopify/ProductVariant/123',
      title: 'Small',
      availableForSale: true,
      price: { amount: '10.00', currencyCode: 'CHF' },
      selectedOptions: [{ name: 'Size', value: 'Small' }]
    }

    it('returns true for valid variants', () => {
      expect(isValidVariant(validVariant)).toBe(true)
    })

    it('returns false for invalid variants', () => {
      expect(isValidVariant(null)).toBe(false)
      expect(isValidVariant({ ...validVariant, id: '' })).toBe(false)
      expect(isValidVariant({ ...validVariant, price: null })).toBe(false)
    })
  })

  describe('sanitizeProduct', () => {
    const validProduct: ShopifyProduct = {
      id: 'gid://shopify/Product/123',
      title: 'Test Product',
      handle: 'test-product',
      description: 'Description',
      descriptionHtml: '<p>Description</p>',
      images: {
        edges: [{
          node: {
            url: 'https://cdn.shopify.com/image.jpg',
            altText: 'Image'
          }
        }]
      },
      variants: {
        edges: [{
          node: {
            id: 'gid://shopify/ProductVariant/456',
            title: 'Default',
            availableForSale: true,
            price: { amount: '20.00', currencyCode: 'CHF' },
            selectedOptions: []
          }
        }]
      },
      priceRange: {
        minVariantPrice: { amount: '20.00', currencyCode: 'CHF' },
        maxVariantPrice: { amount: '20.00', currencyCode: 'CHF' }
      },
      collections: { edges: [] },
      tags: [],
      vendor: 'Vendor',
      productType: 'Type',
      options: [],
      availableForSale: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seo: {}
    }

    it('returns valid products unchanged', () => {
      const result = sanitizeProduct(validProduct)
      expect(result).toEqual(validProduct)
    })

    it('filters out invalid images', () => {
      const productWithBadImages = {
        ...validProduct,
        images: {
          edges: [
            { node: { url: '', altText: 'Bad' } },
            { node: { url: 'https://cdn.shopify.com/good.jpg', altText: 'Good' } }
          ]
        }
      }
      
      const result = sanitizeProduct(productWithBadImages)
      expect(result?.images.edges).toHaveLength(1)
      expect(result?.images.edges[0].node.url).toBe('https://cdn.shopify.com/good.jpg')
    })

    it('returns null for products without valid variants', () => {
      const productWithoutVariants = {
        ...validProduct,
        variants: { edges: [] }
      }
      
      expect(sanitizeProduct(productWithoutVariants)).toBe(null)
    })
  })
})