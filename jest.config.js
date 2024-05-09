module.exports = {
  testMatch: ['**/test/**/*.+(ts|tsx|js)'],
  moduleDirectories: ["node_modules", "/"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
   "node_modules/(?!auth/core.*)"
],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^next-auth$': '<rootDir>/node_modules/next-auth',
  },
};
