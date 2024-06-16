require("dotenv").config();
const { execSync } = require("child_process");

async function integration(): Promise<boolean> {
   try {
      execSync("npx jest --runInBand --bail=3 tests/integration/* --collect-coverage", { stdio: "inherit" });
      return true;
   } catch (error) {
      console.error("Error running integration tests:", error);
      return false;
   }
}

async function main(): Promise<void> {
   let passed: boolean = false;

   try {
      // Setup the docker test environment
      execSync("docker compose -f tests/docker-compose.yaml up -d", { stdio: "inherit" },);
      process.env.DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5431/vitality_test?schema=public";

      // Wait for dock test environment to setup to mitigate time-based conflicts
      await new Promise(resolve => setTimeout(resolve, 10000));

      passed = await integration();
   } catch (error) {
      console.error("Error setting up docker testing environment. Please try again:", error);
   } finally {
      // Cleanup the docker test environment
      try {
         execSync("docker compose -f  tests/docker-compose.yaml down -v --remove-orphans", { stdio: "inherit" },);
      } catch (error) {
         console.error("Error cleaning up docker testing environment. Please manually clean up for future testing:", error);
      }

      process.exit(passed ? 0 : 1);
   }
}

main();