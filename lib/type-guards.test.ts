/**
 * Type Guards Test Suite
 * CLI-testable validation for production safety
 */

import { 
  isValidPrice, 
  isValidVariant, 
  isValidMerchandise, 
  formatPriceSafe, 
  getPriceAmountSafe, 
  hasValidPrimaryVariant 
} from './type-guards';

interface TestCase {
  name: string;
  input: any;
  expected: any;
  validator: (input: any) => any;
}

const testCases: TestCase[] = [
  // isValidPrice tests
  {
    name: 'isValidPrice: valid price object',
    input: { amount: 29.99, currencyCode: 'CHF' },
    expected: true,
    validator: isValidPrice
  },
  {
    name: 'isValidPrice: null input',
    input: null,
    expected: false,
    validator: isValidPrice
  },
  {
    name: 'isValidPrice: undefined input',
    input: undefined,
    expected: false,
    validator: isValidPrice
  },
  {
    name: 'isValidPrice: missing amount',
    input: { currencyCode: 'CHF' },
    expected: false,
    validator: isValidPrice
  },
  {
    name: 'isValidPrice: invalid amount',
    input: { amount: 'invalid', currencyCode: 'CHF' },
    expected: false,
    validator: isValidPrice
  },
  {
    name: 'isValidPrice: negative amount',
    input: { amount: '-10.00', currencyCode: 'CHF' },
    expected: false,
    validator: isValidPrice
  },

  // formatPriceSafe tests
  {
    name: 'formatPriceSafe: valid price',
    input: { amount: 29.99, currencyCode: 'CHF' },
    expected: 'CHF 29.99',
    validator: (input) => formatPriceSafe(input)
  },
  {
    name: 'formatPriceSafe: null price returns dash',
    input: null,
    expected: '–',
    validator: (input) => formatPriceSafe(input)
  },
  {
    name: 'formatPriceSafe: undefined price returns dash',
    input: undefined,
    expected: '–',
    validator: (input) => formatPriceSafe(input)
  },
  {
    name: 'formatPriceSafe: invalid price returns dash',
    input: { amount: 'invalid', currencyCode: 'CHF' },
    expected: '–',
    validator: (input) => formatPriceSafe(input)
  },

  // getPriceAmountSafe tests
  {
    name: 'getPriceAmountSafe: valid price',
    input: { amount: 29.99, currencyCode: 'CHF' },
    expected: 29.99,
    validator: getPriceAmountSafe
  },
  {
    name: 'getPriceAmountSafe: null returns 0',
    input: null,
    expected: 0,
    validator: getPriceAmountSafe
  },
  {
    name: 'getPriceAmountSafe: invalid returns 0',
    input: { amount: 'invalid', currencyCode: 'CHF' },
    expected: 0,
    validator: getPriceAmountSafe
  },

  // hasValidPrimaryVariant tests
  {
    name: 'hasValidPrimaryVariant: valid product',
    input: {
      variants: {
        edges: [{
          node: {
            id: 'variant-1',
            price: { amount: 29.99, currencyCode: 'CHF' },
            availableForSale: true
          }
        }]
      }
    },
    expected: true,
    validator: hasValidPrimaryVariant
  },
  {
    name: 'hasValidPrimaryVariant: no variants',
    input: { variants: { edges: [] } },
    expected: false,
    validator: hasValidPrimaryVariant
  },
  {
    name: 'hasValidPrimaryVariant: null product',
    input: null,
    expected: false,
    validator: hasValidPrimaryVariant
  }
];

/**
 * Run all tests and return results
 */
export function runTypeGuardTests(): { passed: number; failed: number; failures: string[] } {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const testCase of testCases) {
    try {
      const result = testCase.validator(testCase.input);
      
      if (result === testCase.expected || 
          (typeof result === 'string' && typeof testCase.expected === 'string' && 
           result.includes(testCase.expected.replace('CHF ', '')))) {
        passed++;
        console.log(`✅ ${testCase.name}`);
      } else {
        failed++;
        const failureMsg = `❌ ${testCase.name}: expected ${JSON.stringify(testCase.expected)}, got ${JSON.stringify(result)}`;
        failures.push(failureMsg);
        console.log(failureMsg);
      }
    } catch (error) {
      failed++;
      const failureMsg = `❌ ${testCase.name}: threw error ${error}`;
      failures.push(failureMsg);
      console.log(failureMsg);
    }
  }

  return { passed, failed, failures };
}

/**
 * CLI test runner
 */
if (require.main === module) {
  console.log('🧪 Running Type Guards Test Suite...\n');
  
  const results = runTypeGuardTests();
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  if (results.failed > 0) {
    console.log('\n💥 Failures:');
    results.failures.forEach(failure => console.log(failure));
    process.exit(1);
  } else {
    console.log('\n🎉 All type guard tests passed!');
    process.exit(0);
  }
}
