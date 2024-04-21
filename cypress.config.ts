import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },

    // Configuration options for e2e
    baseUrl: "http://localhost:3000",
    fixturesFolder: "cypress/fixtures",
    supportFolder: "cypress/support",
    supportFile: "cypress/support/e2e.ts",
  },
});
