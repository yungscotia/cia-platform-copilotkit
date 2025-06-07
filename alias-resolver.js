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

// Add alias for the runtime package
packageJson.imports['@copilotkit/runtime'] = {
  import: './runtime.js',
  require: './runtime.js'
};

// Write the updated package.json file
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Added import aliases to package.json');
