/**
 * Universal wrapper for the shared package
 * This wrapper uses dynamic imports to work in both CommonJS and ES Module environments
 */

// For CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = require('./CopilotKit/packages/shared/dist/index.js');
}

// For ES Module environments
export default async function getSharedModule() {
  const module = await import('./CopilotKit/packages/shared/dist/index.js');
  return module.default || module;
}

// Also provide direct access to the module for ES Module environments
export * from './CopilotKit/packages/shared/dist/index.js';
