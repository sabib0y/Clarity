// jest.setup.js

// Optional: configure or set up a testing framework before each test
// Jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('@testing-library/jest-dom'); // Use require for CommonJS

// If you need to mock global objects like 'fetch' or 'Notification' for all tests,
// you can do it here. For more targeted mocking (like API calls), MSW is preferred.

// Example: Basic mock for Notification API if needed globally
// (Note: More specific tests might mock this differently)
/*
global.Notification = {
  requestPermission: jest.fn().mockResolvedValue('granted'),
  permission: 'granted',
} as any;

jest.spyOn(global, 'Notification').mockImplementation(((title, options) => {
  console.log(`Mock Notification: ${title} - ${options?.body}`);
  // Return a mock Notification instance if needed by your code
  return {
    // Mock properties/methods as needed
  } as any;
}) as any);
*/

// Setup MSW server for API mocking (we'll configure handlers later)
// import { server } from './src/mocks/server.js' // Adjust path if needed
// beforeAll(() => server.listen())
// afterEach(() => server.resetHandlers())
// afterAll(() => server.close())

// Mock window.matchMedia for libraries like sweetalert2 that use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false, // Default to false, adjust if specific tests need true
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
