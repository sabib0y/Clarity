// src/jest.d.ts
import '@testing-library/jest-dom';

// Optional: If the above import alone doesn't work,
// you might need to explicitly extend the Jest matchers interface.
// See: https://github.com/testing-library/jest-dom?tab=readme-ov-file#with-typescript
// Example (uncomment and adapt if needed):

import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import 'vitest'; // Import vitest types if using Vitest, or remove if using Jest only

// Extend Vitest's Assertion interface if using Vitest
// declare module 'vitest' {
//   interface Assertion<T = any> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
//   interface AsymmetricMatchersContaining extends TestingLibraryMatchers<typeof expect.stringContaining, unknown> {}
// }

// Extend Jest's expect interface
declare module "expect" {
  interface Matchers<R extends void | Promise<void>>
    extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
}
