import '@testing-library/jest-dom';


import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import 'vitest';


// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare module "expect" {
  interface Matchers<R extends void | Promise<void>>
    extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
}
