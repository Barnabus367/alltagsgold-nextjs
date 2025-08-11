import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder in Node if missing
// Cast to any to avoid TS DOM vs Node type mismatches
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { TextDecoder, TextEncoder } = require('util');
if (!(global as any).TextEncoder) (global as any).TextEncoder = TextEncoder as any;
if (!(global as any).TextDecoder) (global as any).TextDecoder = TextDecoder as any;

// Mock next/head to avoid side-effects in tests
jest.mock('next/head', () => {
  return function Head() {
    return null;
  };
});

// Mock @vercel/analytics to avoid runtime errors in tests
jest.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

// Provide a lightweight mock for next/router to avoid 'NextRouter was not mounted' in tests
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));
