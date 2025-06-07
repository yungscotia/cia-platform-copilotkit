/**
 * Test script for the runtime package using ES modules
 * This script tests ES module imports for the runtime package
 */

console.log('Testing runtime package ES module imports...');

// Test ES module import
console.log('\n--- Testing ES module import ---');
try {
  const module = await import('./index.mjs');
  console.log('✅ ES module import successful for runtime');
  console.log('Runtime module keys:', Object.keys(module.runtime).length);
} catch (error) {
  console.error('❌ ES module import failed for runtime:', error.message);
}

// Test direct import
console.log('\n--- Testing direct ES module import ---');
try {
  const module = await import('./runtime.js');
  console.log('✅ Direct ES module import successful for runtime');
  console.log('Runtime module keys:', Object.keys(module).length);
} catch (error) {
  console.error('❌ Direct ES module import failed for runtime:', error.message);
}

console.log('\nAll runtime package ES module tests completed.');
