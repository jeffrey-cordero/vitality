import { defineConfig } from "cypress";

export default defineConfig({
   e2e: {
      setupNodeEvents () {},

      // Configuration options for e2e
      baseUrl: "http://localhost:3000",
      fixturesFolder: "tests/e2e/fixtures",
      supportFolder: "tests/e2e/support",
      supportFile: "tests/e2e/support/e2e.ts",
      specPattern: "tests/e2e/pages/**/**/*.cy.{js,jsx,ts,tsx}"
   }
});
