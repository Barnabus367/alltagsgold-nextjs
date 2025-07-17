import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { generateCheckoutUrl, validateCheckoutUrl } from '@/lib/checkout';

export function CheckoutTester() {
  const { cart } = useCart();
  const { getCheckoutUrl } = useCheckout();
  const [testResults, setTestResults] = useState<string[]>([]);

  const runTests = () => {
    const results: string[] = [];
    
    try {
      // Test 1: Get current checkout URL
      const currentUrl = getCheckoutUrl();
      if (currentUrl) {
        results.push(`✓ Generated URL: ${currentUrl}`);
        
        // Test 2: Validate URL format
        const isValid = validateCheckoutUrl(currentUrl);
        results.push(`✓ URL validation: ${isValid ? 'PASS' : 'FAIL'}`);
        
        // Test 3: Check URL components
        const urlParts = currentUrl.split('/cart/')[1];
        if (urlParts) {
          const items = urlParts.split(',');
          results.push(`✓ Items in URL: ${items.length}`);
          
          items.forEach((item, index) => {
            const [variantId, quantity] = item.split(':');
            results.push(`  Item ${index + 1}: Variant ${variantId}, Qty ${quantity}`);
          });
        }
      } else {
        results.push('✗ No checkout URL generated (cart empty?)');
      }
      
      // Test 4: Cart contents
      if (cart) {
        results.push(`✓ Cart items: ${cart.lines.edges.length}`);
        cart.lines.edges.forEach((edge, index) => {
          const variantId = edge.node.merchandise.id.split('/').pop();
          results.push(`  Cart item ${index + 1}: Variant ${variantId}, Qty ${edge.node.quantity}`);
        });
      } else {
        results.push('✗ No cart data available');
      }
      
    } catch (error) {
      results.push(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setTestResults(results);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-medium text-sm mb-2">Checkout URL Tester</h3>
      
      <Button onClick={runTests} size="sm" className="mb-3">
        Test Checkout URL
      </Button>
      
      {testResults.length > 0 && (
        <div className="bg-gray-50 rounded p-2 text-xs font-mono max-h-48 overflow-y-auto">
          {testResults.map((result, index) => (
            <div key={index} className={result.startsWith('✓') ? 'text-green-600' : result.startsWith('✗') ? 'text-red-600' : 'text-gray-600'}>
              {result}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}