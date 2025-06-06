/**
 * ES Module wrapper for the runtime package
 */

let runtimeModule;

try {
  runtimeModule = await import('../../CopilotKit/packages/runtime/dist/index.js');
} catch (error) {
  console.error('Error loading runtime module (ESM):', error);
  runtimeModule = { default: {} };
}

export default runtimeModule.default || runtimeModule;

// Also export all named exports
Object.entries(runtimeModule).forEach(([key, value]) => {
  if (key !== 'default') {
    // We need to use a different approach for re-exporting
    // This is a workaround since we can't use computed property names in export statements
    exports[key] = value;
  }
});
