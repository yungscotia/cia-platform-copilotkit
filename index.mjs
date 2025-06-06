// ES Module version of the exports
// This file is used when the package is imported in an ES module context

// Import the packages
import runtime from './CopilotKit/packages/runtime/dist/index.js';
import reactCore from './CopilotKit/packages/react-core/dist/index.js';
import reactTextarea from './CopilotKit/packages/react-textarea/dist/index.js';
import reactUi from './CopilotKit/packages/react-ui/dist/index.js';
import runtimeClientGql from './CopilotKit/packages/runtime-client-gql/dist/index.js';
import sdkJs from './CopilotKit/packages/sdk-js/dist/index.js';
import shared from './CopilotKit/packages/shared/dist/index.js';

// Export all CopilotKit packages
export {
  runtime,
  reactCore,
  reactTextarea,
  reactUi,
  runtimeClientGql,
  sdkJs,
  shared
};

// Also provide a default export
export default {
  runtime,
  reactCore,
  reactTextarea,
  reactUi,
  runtimeClientGql,
  sdkJs,
  shared
};
