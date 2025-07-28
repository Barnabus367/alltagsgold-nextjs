// Alternative: Shopify Storefront API für öffentliche Inhalte
// Diese API hat weniger Beschränkungen für öffentliche Daten

const STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

// GraphQL Query für Collections über Storefront API
const COLLECTIONS_QUERY = `
  query {
    collections(first: 50) {
      edges {
        node {
          id
          title
          handle
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

// GraphQL Query für Blog Articles über Storefront API  
const BLOG_ARTICLES_QUERY = `
  query {
    blogs(first: 10) {
      edges {
        node {
          id
          title
          articles(first: 50) {
            edges {
              node {
                id
                title
                image {
                  url
                  altText
                }
                content
              }
            }
          }
        }
      }
    }
  }
`;

export async function getCollectionsViaStorefront() {
  const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2023-10/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: COLLECTIONS_QUERY })
  });

  if (!response.ok) {
    throw new Error(`Storefront API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data.collections.edges.map((edge: any) => edge.node);
}

export async function getBlogArticlesViaStorefront() {
  const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2023-10/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: BLOG_ARTICLES_QUERY })
  });

  if (!response.ok) {
    throw new Error(`Storefront API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data.blogs.edges.flatMap((blog: any) => 
    blog.node.articles.edges.map((article: any) => article.node)
  );
}
