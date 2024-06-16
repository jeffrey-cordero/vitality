import { defineConfig } from "cypress";
require("dotenv").config();

export default defineConfig({
   e2e: {
      setupNodeEvents (on, config) {
         // implement node event listeners here
      },

      // Configuration options for e2e
      baseUrl: process.env.BASE_URL,
      fixturesFolder: "tests/e2e/fixtures",
      supportFolder: "tests/e2e/support",
      supportFile: "tests/e2e/support/e2e.ts",
      specPattern: "tests/e2e/pages/**/**/*.cy.{js,jsx,ts,tsx}",
      retries: 3
   }
});