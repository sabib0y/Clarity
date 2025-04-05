// src/jest.d.ts
import '@testing-library/jest-dom';

// Optional: If the above import alone doesn't work,
// you might need to explicitly extend the Jest matchers interface.
// See: https://github.com/testing-library/jest-dom?tab=readme-ov-file#with-typescript
// Example (uncomment and adapt if needed):
/*
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "expect" {
  interface Matchers<R extends void | Promise<void>>
    extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
}
*/
