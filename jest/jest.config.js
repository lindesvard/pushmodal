const path = require('path');

module.exports = {
  // A list of paths to directories that Jest should use to search for files in.
  roots: [`<rootDir>/../src`],
  // setupFiles before the tests are ran
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  // The glob patterns Jest uses to detect test files
  testMatch: [
    `<rootDir>/../src/**/__tests__/**/*.{js,jsx,ts,tsx}`,
    `<rootDir>/../src/**/*.{spec,test}.{js,jsx,ts,tsx}`,
  ],
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': [
      'babel-jest',
      { configFile: path.join(__dirname, '../babel.config.json') },
    ],
    '^.+\\.css$': '<rootDir>/transforms/cssTransform.js',
    '^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)': '<rootDir>/transforms/fileTransform.js',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    '^.+\\.(css|sass|scss)$',
  ],
  modulePaths: [],
  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources, like images or styles with a single module.
  moduleNameMapper: {
    // for css modules
    '^.+\\.(css|scss)$': 'identity-obj-proxy',
  },
  // An array of file extensions your modules use
  moduleFileExtensions: ['ts', 'tsx', 'json', 'js', 'jsx', 'node'],
  // This option allows you to use custom watch plugins
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  // Automatically reset mock state before every test
  resetMocks: true,
  // Make calling deprecated APIs throw helpful error messages
  errorOnDeprecated: true,
  testEnvironmentOptions: {
    // This option sets the URL for the jsdom environment. It is reflected in properties such as location.href
    url: 'http://localhost',
  },
};
