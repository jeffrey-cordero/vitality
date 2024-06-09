const { execSync } = require("child_process");
require("dotenv").config();

async function runTest(command : string): Promise<boolean> {
   let retries = 1;

   while (retries <= 3) {
      try {
         execSync(command, { stdio: "inherit" });
         break;
      } catch (error) {
         console.error(`Error running tests (Attempt #${retries}):`, error);
      }

      retries++;
   }

   return retries <= 3;
}

async function integration(): Promise<boolean> {
   process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5431/vitality_test?schema=public";
   const integration = await runTest("npx jest --runInBand tests/integration/* --collect-coverage");

   if (!(integration)) {
      console.error("Some integration tests have failed.");
      return false;
   }

   return true;
}

async function endToEnd(type: "test" | "run"): Promise<boolean> {
   process.env.BASE_URL = "http://localhost:3001";
   const endToEndCommand = type === "test" ? "npx cypress open" : "npx cypress run";
   const endToEnd = await runTest(endToEndCommand);

   if (type === "run" && !(endToEnd)) {
      console.error("Some end to end tests have failed.");
      return false;
   }

   return true;
}

async function main(): Promise<void> {
   let passed = false;
   console.log("Setting up docker testing environment.");

   try {
      // Setup the docker test environment
      execSync("docker compose -f tests/docker-compose.yaml up -d", { stdio: "inherit" },);

      // Wait for dock test environment to setup to mitigate database conflicts
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

      if (!(passed)) {
         process.exit(1);
      }
   }
}

main();