/**
 * Test script for the runtime package
 * This script tests both CommonJS and ES Module imports
 */

console.log('Testing runtime package imports...');

// Test CommonJS import
try {
  console.log('\n--- Testing CommonJS import ---');
  const runtime = require('./runtime');
  console.log('✅ CommonJS import successful');
  console.log('Runtime module keys:', Object.keys(runtime));
} catch (error) {
  console.error('❌ CommonJS import failed:', error.message);
}

// Test dynamic import (works in both CommonJS and ES Module environments)
console.log('\n--- Testing dynamic import ---');
import('./runtime.js')
  .then(module => {
    console.log('✅ Dynamic import successful');
    console.log('Runtime module keys:', Object.keys(module));
    
    // Test the default export function
    return module.default();
  })
  .then(runtimeModule => {
    console.log('✅ Default export function returned:', typeof runtimeModule);
    console.log('Runtime module keys from default function:', Object.keys(runtimeModule));
  })
  .catch(error => {
    console.error('❌ Dynamic import failed:', error.message);
  });
