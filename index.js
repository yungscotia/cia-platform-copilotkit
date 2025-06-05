// Export all CopilotKit packages
module.exports = {
  runtime: require('./CopilotKit/packages/runtime/dist/index.js'),
  reactCore: require('./CopilotKit/packages/react-core/dist/index.js'),
  reactTextarea: require('./CopilotKit/packages/react-textarea/dist/index.js'),
  reactUi: require('./CopilotKit/packages/react-ui/dist/index.js'),
  runtimeClientGql: require('./CopilotKit/packages/runtime-client-gql/dist/index.js'),
  sdkJs: require('./CopilotKit/packages/sdk-js/dist/index.js'),
  shared: require('./CopilotKit/packages/shared/dist/index.js')
};
