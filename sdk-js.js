/**
 * Universal wrapper for the sdk-js package
 * This wrapper uses dynamic imports to work in both CommonJS and ES Module environments
 */

// For CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  // The index.js file is empty, so we need to import from langchain.js and langgraph.js
  const langchainModule = require('./CopilotKit/packages/sdk-js/dist/langchain.js');
  const langgraphModule = require('./CopilotKit/packages/sdk-js/dist/langgraph.js');
  
  // Combine the exports from both modules
  module.exports = {
    ...langchainModule,
    ...langgraphModule
  };
}

// For ES Module environments
export default async function getSdkJsModule() {
  // The index.js file is empty, so we need to import from langchain.js and langgraph.js
  const [langchainModule, langgraphModule] = await Promise.all([
    import('./CopilotKit/packages/sdk-js/dist/langchain.js'),
    import('./CopilotKit/packages/sdk-js/dist/langgraph.js')
  ]);
  
  // Combine the exports from both modules
  return {
    ...langchainModule,
    ...langgraphModule
  };
}

// Also provide direct access to the modules for ES Module environments
export * from './CopilotKit/packages/sdk-js/dist/langchain.js';
export * from './CopilotKit/packages/sdk-js/dist/langgraph.js';
