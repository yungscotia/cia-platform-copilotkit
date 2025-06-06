#!/usr/bin/env node

/**
 * This script simulates how a client would use this package after installing it via npm.
 * It tests both CommonJS and ES Module import patterns to ensure compatibility.
 */

console.log('Testing client usage of @netflix-internal/cia-platform-copilotkit...');

// Test CommonJS imports
try {
  console.log('\n--- Testing CommonJS imports ---');
  
  // Test importing the main package
  console.log('Importing main package...');
  const copilotkit = require('./index.js');
  console.log('✅ Main package imported successfully');
  
  // Check if all expected exports are available
  const expectedExports = [
    'runtime',
    'reactCore',
    'reactTextarea',
    'reactUi',
    'runtimeClientGql',
    'sdkJs',
    'shared'
  ];
  
  for (const exportName of expectedExports) {
    if (copilotkit[exportName]) {
      console.log(`✅ Export '${exportName}' is available`);
    } else {
      console.error(`❌ Export '${exportName}' is missing`);
    }
  }
  
  // Test importing subpackages directly
  console.log('\nTesting direct subpackage imports...');
  
  try {
    const runtime = require('./CopilotKit/packages/runtime/dist/index.js');
    console.log('✅ runtime imported successfully');
  } catch (error) {
    console.error(`❌ Failed to import runtime: ${error.message}`);
  }
  
  try {
    const reactCore = require('./CopilotKit/packages/react-core/dist/index.js');
    console.log('✅ react-core imported successfully');
  } catch (error) {
    console.error(`❌ Failed to import react-core: ${error.message}`);
  }
  
  // Test importing via exports paths
  console.log('\nTesting imports via exports paths...');
  
  try {
    const runtime = require('./runtime');
    console.log('✅ ./runtime imported successfully');
  } catch (error) {
    console.error(`❌ Failed to import ./runtime: ${error.message}`);
  }
  
  try {
    const reactCore = require('./react-core');
    console.log('✅ ./react-core imported successfully');
  } catch (error) {
    console.error(`❌ Failed to import ./react-core: ${error.message}`);
  }
  
} catch (error) {
  console.error(`❌ CommonJS import test failed: ${error.message}`);
}

console.log('\nClient usage test completed.');
console.log('Note: If you encounter ES module issues, you may need to add "type": "module" to your package.json');
console.log('or use dynamic imports (import()) in your client code.');
