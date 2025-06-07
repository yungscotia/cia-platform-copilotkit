/**
 * This script adds import aliases to package.json to resolve @copilotkit/* imports
 * to local paths within the package.
 */

const fs = require('fs');
const path = require('path');

// Read the package.json file
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = require(packageJsonPath);

// Add imports field for Node.js import aliases
if (!packageJson.imports) {
  packageJson.imports = {};
}

// Add aliases for each @copilotkit package
packageJson.imports['@copilotkit/runtime'] = {
  import: './runtime.js',
  require: './runtime.js'
};

packageJson.imports['@copilotkit/react-core'] = {
  import: './react-core.js',
  require: './react-core.js'
};

packageJson.imports['@copilotkit/react-textarea'] = {
  import: './react-textarea.js',
  require: './react-textarea.js'
};

packageJson.imports['@copilotkit/react-ui'] = {
  import: './react-ui.js',
  require: './react-ui.js'
};

packageJson.imports['@copilotkit/runtime-client-gql'] = {
  import: './runtime-client-gql.js',
  require: './runtime-client-gql.js'
};

packageJson.imports['@copilotkit/sdk-js'] = {
  import: './sdk-js.js',
  require: './sdk-js.js'
};

packageJson.imports['@copilotkit/shared'] = {
  import: './shared.js',
  require: './shared.js'
};

// Write the updated package.json file
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Added import aliases to package.json');
