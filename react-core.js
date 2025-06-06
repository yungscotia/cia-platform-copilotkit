/**
 * Universal wrapper for the react-core package
 * This wrapper uses dynamic imports to work in both CommonJS and ES Module environments
 */

// For CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = require('./CopilotKit/packages/react-core/dist/index.js');
}

// For ES Module environments
export default async function getReactCoreModule() {
  const module = await import('./CopilotKit/packages/react-core/dist/index.js');
  return module.default || module;
}

// Also provide direct access to the module for ES Module environments
export * from './CopilotKit/packages/react-core/dist/index.js';
