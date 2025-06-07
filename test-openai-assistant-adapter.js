/**
 * Test script to verify that OpenAIAssistantAdapter is properly exported
 */

console.log('Testing OpenAIAssistantAdapter export...');

// Test direct import from the package
try {
  const { OpenAIAssistantAdapter } = require('./index.js');
  console.log('✅ OpenAIAssistantAdapter is available at the top level');
  console.log('OpenAIAssistantAdapter is a constructor:', typeof OpenAIAssistantAdapter === 'function');
  console.log('OpenAIAssistantAdapter prototype:', Object.keys(OpenAIAssistantAdapter.prototype || {}));
} catch (error) {
  console.error('❌ Failed to import OpenAIAssistantAdapter from top level:', error.message);
}

// Test import from runtime
try {
  const { runtime } = require('./index.js');
  console.log('\nTesting import from runtime property:');
  console.log('✅ runtime.OpenAIAssistantAdapter is available:', !!runtime.OpenAIAssistantAdapter);
  console.log('runtime.OpenAIAssistantAdapter is a constructor:', typeof runtime.OpenAIAssistantAdapter === 'function');
  console.log('runtime.OpenAIAssistantAdapter prototype:', Object.keys(runtime.OpenAIAssistantAdapter.prototype || {}));
} catch (error) {
  console.error('❌ Failed to import OpenAIAssistantAdapter from runtime:', error.message);
}

// Test import from runtime package
try {
  const runtime = require('./runtime.js');
  console.log('\nTesting import from runtime package:');
  console.log('✅ runtime.OpenAIAssistantAdapter is available:', !!runtime.OpenAIAssistantAdapter);
  console.log('runtime.OpenAIAssistantAdapter is a constructor:', typeof runtime.OpenAIAssistantAdapter === 'function');
  console.log('runtime.OpenAIAssistantAdapter prototype:', Object.keys(runtime.OpenAIAssistantAdapter.prototype || {}));
} catch (error) {
  console.error('❌ Failed to import OpenAIAssistantAdapter from runtime package:', error.message);
}

console.log('\nTest completed.');
