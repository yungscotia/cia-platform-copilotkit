// This script tests ES Module imports of the package
// Using .mjs extension to ensure it's treated as an ES module

import * as copilotkit from './index.mjs';

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
