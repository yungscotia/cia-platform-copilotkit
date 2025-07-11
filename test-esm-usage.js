// This script tests ES Module imports of the package
// To run this script, you need to set "type": "module" in package.json
// or use the .mjs extension

import * as copilotkit from './index.js';

console.log('Testing ES Module imports of @netflix-internal/cia-platform-copilotkit...');

// Check if all expected exports are available
const expectedExports = [
  'runtime',
  'reactCore',
  'reactTextarea',
  'reactUi',
  'runtimeClientGql',
  'sdkJs',
  'shared'
];

for (const exportName of expectedExports) {
  if (copilotkit[exportName]) {
    console.log(`✅ Export '${exportName}' is available`);
  } else {
    console.error(`❌ Export '${exportName}' is missing`);
  }
}

console.log('\nES Module import test completed.');
