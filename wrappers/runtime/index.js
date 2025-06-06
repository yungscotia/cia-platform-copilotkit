/**
 * Universal wrapper for the runtime package
 * This wrapper handles both CommonJS and ES Module environments
 */

// Check if we're in an ES module environment
const isESM = typeof require === 'undefined' || typeof module === 'undefined' || !module.exports;

let runtimeModule;

try {
  if (isESM) {
    // ES Module environment
    // This will be executed when imported via import statement
    const modulePromise = import('../../CopilotKit/packages/runtime/dist/index.js');
    
    // Export a proxy that will resolve once the module is loaded
    const proxy = new Proxy({}, {
      get: (target, prop) => {
        return (...args) => {
          return modulePromise.then(module => {
            return module.default[prop](...args);
          });
        };
      }
    });
    
    export default proxy;
    
    // Also export individual named exports
    modulePromise.then(module => {
      Object.keys(module).forEach(key => {
        if (key !== 'default') {
          exports[key] = module[key];
        }
      });
    });
  } else {
    // CommonJS environment
    // This will be executed when imported via require()
    runtimeModule = require('../../CopilotKit/packages/runtime/dist/index.js');
    module.exports = runtimeModule;
  }
} catch (error) {
  console.error('Error loading runtime module:', error);
  // Provide a fallback empty module to prevent crashes
  if (isESM) {
    export default {};
  } else {
    module.exports = {};
  }
}
