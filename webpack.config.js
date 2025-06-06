const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    'index': './index.js',
    'runtime': './CopilotKit/packages/runtime/dist/index.js',
    'shared': './CopilotKit/packages/shared/dist/index.js',
    'react-core': './CopilotKit/packages/react-core/dist/index.js',
    'react-textarea': './CopilotKit/packages/react-textarea/dist/index.js',
    'react-ui': './CopilotKit/packages/react-ui/dist/index.js',
    'runtime-client-gql': './CopilotKit/packages/runtime-client-gql/dist/index.js',
    'sdk-js': './CopilotKit/packages/sdk-js/dist/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    libraryTarget: 'commonjs2'
  },
  target: 'node',
  externals: [
    // Add any dependencies that should not be bundled
    // For example, if you want to exclude some large dependencies
    // that are unlikely to cause ES module issues
    /^react($|\/)/,
    /^react-dom($|\/)/
  ],
  resolve: {
    extensions: ['.js', '.json', '.mjs'],
    // Force webpack to resolve these extensions in this order
    mainFields: ['main', 'module']
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        // Don't exclude node_modules to ensure all dependencies are bundled
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  // Prevent webpack from splitting the bundle
  optimization: {
    minimize: true
  }
};
