/**
 * Test script for the runtime package
 * This script tests both CommonJS and dynamic imports for the runtime package
 */

console.log('Testing runtime package imports...');

// Test CommonJS import
console.log('\n--- Testing CommonJS import ---');
try {
  const { runtime } = require('./index.js');
  console.log('✅ CommonJS import successful for runtime');
  console.log('Runtime module keys:', Object.keys(runtime).length);
} catch (error) {
  console.error('❌ CommonJS import failed for runtime:', error.message);
}

// Test direct import
console.log('\n--- Testing direct import ---');
try {
  const runtime = require('./runtime.js');
  console.log('✅ Direct import successful for runtime');
  console.log('Runtime module keys:', Object.keys(runtime).length);
} catch (error) {
  console.error('❌ Direct import failed for runtime:', error.message);
}

// Test @copilotkit/runtime import
console.log('\n--- Testing @copilotkit/runtime import ---');
try {
  const runtime = require('@copilotkit/runtime');
  console.log('✅ @copilotkit/runtime import successful');
  console.log('Runtime module keys:', Object.keys(runtime).length);
} catch (error) {
  console.error('❌ @copilotkit/runtime import failed:', error.message);
}

console.log('\nAll runtime package tests completed.');
