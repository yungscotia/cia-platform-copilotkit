/**
 * Test script for all packages
 * This script tests both CommonJS and dynamic imports for all packages
 */

console.log('Testing all package imports...');

// List of all packages to test
const packages = [
  'runtime',
  'react-core',
  'react-textarea',
  'react-ui',
  'runtime-client-gql',
  'sdk-js',
  'shared'
];

// Test CommonJS imports
console.log('\n--- Testing CommonJS imports ---');
for (const pkg of packages) {
  try {
    const module = require(`./${pkg}`);
    console.log(`✅ CommonJS import successful for ${pkg}`);
    console.log(`${pkg} module keys:`, Object.keys(module).length);
  } catch (error) {
    console.error(`❌ CommonJS import failed for ${pkg}:`, error.message);
  }
}

// Test dynamic imports
console.log('\n--- Testing dynamic imports ---');
async function testDynamicImports() {
  for (const pkg of packages) {
    try {
      const module = await import(`./${pkg}.js`);
      console.log(`✅ Dynamic import successful for ${pkg}`);
      console.log(`${pkg} module keys:`, Object.keys(module).length);
      
      // Test the default export function
      try {
        const moduleInstance = await module.default();
        console.log(`✅ Default export function returned for ${pkg}:`, typeof moduleInstance);
        console.log(`${pkg} module instance keys:`, Object.keys(moduleInstance).length);
      } catch (error) {
        console.error(`❌ Default export function failed for ${pkg}:`, error.message);
      }
    } catch (error) {
      console.error(`❌ Dynamic import failed for ${pkg}:`, error.message);
    }
  }
}

testDynamicImports().then(() => {
  console.log('\nAll package tests completed.');
});
