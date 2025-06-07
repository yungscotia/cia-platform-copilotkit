// First, load the runtime package
const runtime = require('./CopilotKit/packages/runtime/dist/index.js');

// Export the runtime package
module.exports = {
  runtime
};

// Also export the package with its original name for backward compatibility
module.exports['@copilotkit/runtime'] = runtime;
