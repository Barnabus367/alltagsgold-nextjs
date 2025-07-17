// Shopify GraphQL API Types

export interface ShopifyImage {
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyProductOption {
  name: string;
  values: string[];
}

export interface ShopifySelectedOption {
  name: string;
  value: string;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: ShopifySelectedOption[];
  price: ShopifyMoney;
  compareAtPrice?: ShopifyMoney;
  quantityAvailable?: number;
  image?: ShopifyImage;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  totalInventory?: number;
  vendor: string;
  productType: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  onlineStoreUrl?: string;
  collections?: {
    edges: Array<{
      node: {
        id: string;
        handle: string;
        title: string;
      };
    }>;
  };
  options: ShopifyProductOption[];
  images: {
    edges: Array<{
      node: ShopifyImage;
    }>;
  };
  variants: {
    edges: Array<{
      node: ShopifyProductVariant;
    }>;
  };
  featuredImage?: ShopifyImage;
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  compareAtPriceRange?: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  seo: {
    title?: string;
    description?: string;
  };
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  updatedAt: string;
  image?: ShopifyImage;
  products: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
  };
  seo: {
    title?: string;
    description?: string;
  };
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: ShopifyProductVariant & {
    product: ShopifyProduct;
  };
  estimatedCost: {
    totalAmount: ShopifyMoney;
    subtotalAmount: ShopifyMoney;
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  webUrl: string;
  totalQuantity: number;
  lines: {
    edges: Array<{
      node: ShopifyCartLine;
    }>;
  };
  estimatedCost: {
    totalAmount: ShopifyMoney;
    subtotalAmount: ShopifyMoney;
    totalTaxAmount?: ShopifyMoney;
    totalDutyAmount?: ShopifyMoney;
  };
  buyerIdentity?: {
    email?: string;
    phone?: string;
    customer?: {
      id: string;
    };
    countryCode?: string;
  };
}

export interface CartItem {
  id: string;
  merchandiseId: string;
  quantity: number;
  variantId?: string;
}

// Blog Types
export interface ShopifyBlogPost {
  id: string;
  title: string;
  handle: string;
  content: string;
  contentHtml: string;
  excerpt?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  image?: ShopifyImage;
  seo?: {
    title?: string;
    description?: string;
  };
  blog: {
    id: string;
    handle: string;
    title: string;
  };
}

export interface ShopifyBlog {
  id: string;
  title: string;
  handle: string;
}

// Alias for ShopifyProductVariant for backward compatibility
export interface ShopifyVariant {
  id: string;
  title: string;
  price: ShopifyMoney;
  availableForSale: boolean;
  selectedOptions: ShopifySelectedOption[];
  compareAtPrice?: ShopifyMoney;
  quantityAvailable?: number;
  image?: ShopifyImage;
}