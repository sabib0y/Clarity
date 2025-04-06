// jest.config.cjs
// Revert ESLint disable comment - accept the warning for now
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextJest = require('next/jest');

// Providing the path to your Next.js app to load next.config.js and .env files in your test environment
const createJestConfig = nextJest({
  dir: './',
})

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'], // Update to .cjs extension

  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],

  testEnvironment: 'jest-environment-jsdom',

  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,

  // Temporarily disable coverage collection for troubleshooting
  // collectCoverage: true,
  // coverageDirectory: "coverage",
  // collectCoverageFrom: [
  //   'src/**/*.{js,jsx,ts,tsx}',
  //   '!src/**/*.d.ts',
  //   '!src/**/layout.tsx',
  //   '!src/**/page.tsx',
  //   '!src/app/api/**/route.ts',
  //   '!src/libs/**',
  //   '!**/node_modules/**',
  //   '!<rootDir>/.next/**',
  //   '!<rootDir>/coverage/**',
  //   '!<rootDir>/*.config.js',
  //   '!<rootDir>/*.config.mjs',
  // ],

  // Module name mapper for handling CSS Modules, images, etc. (adjust if needed)
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    // https://jestjs.io/docs/webpack#mocking-css-modules
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',

    // Handle CSS imports (without CSS modules), EXCLUDING react-calendar's CSS
    // Use a negative lookahead to avoid matching the specific calendar CSS file
    '^(?!.*react-calendar/dist/Calendar\\.css$).+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',

    // Handle image imports
    // https://jestjs.io/docs/webpack#handling-static-assets
    '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i': `<rootDir>/__mocks__/fileMock.js`,

    // Handle module aliases (if you have them in tsconfig.json)
    // Example: '^@/components/(.*)$': '<rootDir>/src/components/$1'
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Ignore Next.js specific folders/files from tests if not needed
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
