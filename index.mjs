// ES Module version of the exports
// This file is used when the package is imported in an ES module context

// Import the runtime package
import runtime from './CopilotKit/packages/runtime/dist/index.js';
import * as runtimeExports from './CopilotKit/packages/runtime/dist/index.js';

// Export the runtime package
export {
  runtime
};

// Export all properties from the runtime package at the top level
export * from './CopilotKit/packages/runtime/dist/index.js';

// Also provide a default export
export default {
  runtime,
  ...runtimeExports
};
