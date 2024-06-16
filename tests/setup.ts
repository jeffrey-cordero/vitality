require("dotenv").config();
const { execSync } = require("child_process");

async function runTest(command : string): Promise<boolean> {
   try {
      execSync(command, { stdio: "inherit" });
      return true;
   } catch (error) {
      console.error("Error running tests", error);
      return false;
   }
}

async function integration(): Promise<boolean> {
   if (!(await runTest("npx jest --runInBand --bail=3 tests/integration/* --collect-coverage"))) {
      console.error("Some integration tests have failed.");
      return false;
   }

   return true;
}

async function endToEnd(type: "test" | "run"): Promise<boolean> {
   const endToEndTestingType: string = type === "test" ? "npx cypress open" : "npx cypress run";

   if (!(await runTest(endToEndTestingType)) && type === "run") {
      console.error("Some end to end tests have failed.");
      return false;
   }

   return true;
}

async function main(): Promise<void> {
   console.log("Setting up docker testing environment.");
   let passed: boolean = false;

   try {
      // Setup the docker test environment
      execSync("docker compose -f tests/docker-compose.yaml up -d", { stdio: "inherit" },);
      process.env.DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5431/vitality_test?schema=public";
      process.env.BASE_URL = "http://127.0.0.1:3001";

      // Wait for dock test environment to setup to mitigate time-based conflicts
      await new Promise(resolve => setTimeout(resolve, 10000));

      if (process.argv.includes("integration")) {
         passed = await integration();
      } else {
         passed = await endToEnd(process.argv.includes("e2e:run") ? "run" : "test");
      }
   } catch (error) {
      console.error("Error setting up docker testing environment. Please try again:", error);
   } finally {
      // Cleanup the docker test environment
      try {
         console.log("Cleaning up docker testing environment.");
         execSync("docker compose -f  tests/docker-compose.yaml down -v --remove-orphans", { stdio: "inherit" },);
      } catch (error) {
         console.error("Error cleaning up docker testing environment. Please manually clean up for future testing:", error);
      }

      process.exit(passed ? 0 : 1);
   }
}

main();