const nextJest = require("next/jest");

const createJestConfig = nextJest({
   dir: "./"
});

const customJestConfig = {
   clearMocks: true,
   preset: "ts-jest",
   testEnvironment: "node",
   setupFilesAfterEnv: ["<rootDir>/singleton.ts"],
   moduleDirectories: ["node_modules", "<rootDir>/"],
   moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/$1"
   }
};

module.exports = createJestConfig(customJestConfig);
