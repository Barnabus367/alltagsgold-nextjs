// Test Cloudinary Configuration
const fs = require('fs');

// Manual .env parsing
function loadEnv() {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.log('Error reading .env.local:', error.message);
    return {};
  }
}

const env = loadEnv();

console.log('=== CLOUDINARY CONFIGURATION TEST ===');
console.log('CLOUDINARY_CLOUD_NAME:', env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');
console.log('CLOUDINARY_URL:', env.CLOUDINARY_URL ? 'SET' : 'NOT SET');

// Test URL generation
const cloudName = env.CLOUDINARY_CLOUD_NAME || 'do7yh4dll';
const testImageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_800,q_auto,f_webp/v1750349707/pexels-sorjigrey-9956769_li3wx9.jpg`;

console.log('\n=== TEST IMAGE URL ===');
console.log('Generated URL:', testImageUrl);

console.log('\n=== TEST COMPLETED ===');
