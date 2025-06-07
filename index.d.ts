/**
 * Type declarations for @netflix-internal/cia-platform-copilotkit
 */

// Import the runtime types
import * as RuntimeTypes from './CopilotKit/packages/runtime/dist/index';

// Export the runtime types
export declare const runtime: typeof RuntimeTypes;

// Export the runtime types as the default export
declare const _default: {
  runtime: typeof RuntimeTypes;
} & typeof RuntimeTypes;

export default _default;

// Re-export all types from the runtime package
// This allows TypeScript to see all the types when importing from this package
export * from './CopilotKit/packages/runtime/dist/index';
