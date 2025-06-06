/**
 * CommonJS wrapper for the runtime package
 */

try {
  const runtimeModule = require('../../CopilotKit/packages/runtime/dist/index.js');
  module.exports = runtimeModule;
} catch (error) {
  console.error('Error loading runtime module (CommonJS):', error);
  module.exports = {};
}
