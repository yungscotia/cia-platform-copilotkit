// First, load all the packages
const runtime = require('./CopilotKit/packages/runtime/dist/index.js');
const reactCore = require('./CopilotKit/packages/react-core/dist/index.js');
const reactTextarea = require('./CopilotKit/packages/react-textarea/dist/index.js');
const reactUi = require('./CopilotKit/packages/react-ui/dist/index.js');
const runtimeClientGql = require('./CopilotKit/packages/runtime-client-gql/dist/index.js');
const sdkJs = require('./CopilotKit/packages/sdk-js/dist/index.js');
const shared = require('./CopilotKit/packages/shared/dist/index.js');

// Export all CopilotKit packages
module.exports = {
  runtime,
  reactCore,
  reactTextarea,
  reactUi,
  runtimeClientGql,
  sdkJs,
  shared
};

// Also export the packages with their original names for backward compatibility
module.exports['@copilotkit/runtime'] = runtime;
module.exports['@copilotkit/react-core'] = reactCore;
module.exports['@copilotkit/react-textarea'] = reactTextarea;
module.exports['@copilotkit/react-ui'] = reactUi;
module.exports['@copilotkit/runtime-client-gql'] = runtimeClientGql;
module.exports['@copilotkit/sdk-js'] = sdkJs;
module.exports['@copilotkit/shared'] = shared;
