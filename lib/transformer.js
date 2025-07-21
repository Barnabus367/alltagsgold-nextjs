const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

class CodeTransformer {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
  }

  transformComponent(sourceCode, filePath) {
    try {
      const ast = parse(sourceCode, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      });

      let transformed = false;
      const transformations = [];

      traverse(ast, {
        ImportDeclaration(path) {
          const source = path.node.source.value;
          
          // Transform React Router imports
          if (source.includes('react-router-dom')) {
            // Remove React Router imports that are not needed in Next.js
            const specifiers = path.node.specifiers.filter(spec => {
              const importName = spec.imported?.name || spec.local?.name;
              return !['BrowserRouter', 'Router', 'Routes', 'Route', 'Navigate'].includes(importName);
            });

            if (specifiers.length === 0) {
              path.remove();
              transformed = true;
              transformations.push('Removed React Router imports');
            } else {
              path.node.specifiers = specifiers;
              transformed = true;
              transformations.push('Filtered React Router imports');
            }
          }

          // Transform relative imports that might need adjustment
          if (source.startsWith('./') || source.startsWith('../')) {
            // Keep relative imports as-is for now
            // Could be enhanced to handle specific patterns
          }

          // Transform asset imports
          if (source.match(/\.(css|scss|sass|less)$/)) {
            // CSS imports remain the same in Next.js
          }
        },

        JSXElement(path) {
          const elementName = path.node.openingElement.name.name;
          
          // Transform React Router elements
          if (['Routes', 'Route', 'BrowserRouter'].includes(elementName)) {
            // Comment out or remove routing elements
            path.addComment('leading', ` TODO: Convert to Next.js routing `);
            transformed = true;
            transformations.push(`Found ${elementName} - needs manual conversion`);
          }
        },

        CallExpression(path) {
          // Transform useNavigate, useHistory hooks
          if (path.node.callee.name === 'useNavigate' || path.node.callee.name === 'useHistory') {
            path.addComment('leading', ` TODO: Replace with Next.js useRouter `);
            transformed = true;
            transformations.push(`Found ${path.node.callee.name} - replace with useRouter`);
          }
        }
      });

      const result = generate(ast, {
        retainLines: true,
        comments: true
      });

      return {
        code: result.code,
        transformed,
        transformations
      };

    } catch (error) {
      if (this.verbose) {
        console.log(`    ⚠️  Could not transform ${filePath}: ${error.message}`);
      }
      return {
        code: sourceCode,
        transformed: false,
        transformations: [],
        error: error.message
      };
    }
  }

  transformRouteToNextPage(routeInfo) {
    // Convert React Router route to Next.js page structure
    const routePath = routeInfo.path;
    
    if (routePath === '/') {
      return 'pages/index.js';
    }
    
    // Handle dynamic routes
    if (routePath.includes(':')) {
      const nextjsPath = routePath
        .replace(/^\//, '')
        .replace(/:([^/]+)/g, '[$1]')
        .replace(/\//g, '/');
      return `pages/${nextjsPath}.js`;
    }
    
    // Handle static routes
    const cleanPath = routePath.replace(/^\//, '').replace(/\/$/, '');
    if (cleanPath === '') {
      return 'pages/index.js';
    }
    
    return `pages/${cleanPath}.js`;
  }

  generateNextPageWrapper(componentCode, componentName) {
    return `import React from 'react';
import { useRouter } from 'next/router';

// Migrated from Vite React Router
${componentCode}

// Next.js page wrapper
export default function ${componentName}Page() {
  const router = useRouter();
  
  return <${componentName} />;
}
`;
  }

  transformPackageJson(originalPackageJson) {
    const transformed = { ...originalPackageJson };
    
    // Update scripts
    transformed.scripts = {
      ...transformed.scripts,
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint'
    };
    
    // Remove Vite dependencies
    if (transformed.devDependencies) {
      delete transformed.devDependencies.vite;
      delete transformed.devDependencies['@vitejs/plugin-react'];
      delete transformed.devDependencies['@vitejs/plugin-react-swc'];
    }
    
    // Remove React Router dependencies
    if (transformed.dependencies) {
      delete transformed.dependencies['react-router'];
      delete transformed.dependencies['react-router-dom'];
    }
    
    // Add Next.js dependencies
    transformed.dependencies = {
      ...transformed.dependencies,
      next: '^14.0.0',
      react: '^18.0.0',
      'react-dom': '^18.0.0'
    };
    
    transformed.devDependencies = {
      ...transformed.devDependencies,
      eslint: '^8.0.0',
      'eslint-config-next': '^14.0.0'
    };
    
    return transformed;
  }

  generateNextConfig(viteConfig) {
    // Basic Next.js config
    let nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,`;

    // Try to extract useful settings from Vite config
    if (viteConfig && viteConfig.content) {
      // Look for base URL configuration
      if (viteConfig.content.includes('base:')) {
        nextConfig += `
  basePath: '', // TODO: Configure if needed`;
      }
      
      // Look for port configuration
      if (viteConfig.content.includes('port:')) {
        nextConfig += `
  // Port configuration handled by Next.js dev server`;
      }
    }

    nextConfig += `
  // TODO: Review and configure as needed
  // - API routes
  // - Image optimization
  // - Custom webpack config
  // - Environment variables
}

module.exports = nextConfig
`;

    return nextConfig;
  }
}

module.exports = { CodeTransformer };
