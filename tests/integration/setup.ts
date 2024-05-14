require("dotenv").config();
const { execSync } = require("child_process");

let passedTests = false;

try {
   console.log("Setting up tests.");

   // Database will be on localhost:5431
   process.env.DATABASE_URL = process.env.DATABASE_TEST_URL;

   // Build and start the docker integration environment
   execSync("docker build -t vitality_postgres_test_image tests/integration/", { stdio: "inherit" },);
   execSync("docker run -d --name vitality_postgres_test -p 5431:5432 vitality_postgres_test_image", { stdio: "inherit" });

   // Run all unit tests with at most 3 retries for potential time-based database conflicts
   let retries = 1;

   while (retries <= 3) {
      try {
         execSync("npx jest tests/integration/* --collect-coverage", { stdio: "inherit" });
         break;
      } catch (error) {
         console.error(`Error running tests (Attempt #${retries}):`, error);
      }

      retries++;
   }

   passedTests = retries <= 3;
} catch (error) {
   console.error("Error setting up tests:", error);
   process.exit(1);
} finally {
   // Cleanup the docker integration environment
   try {
      console.log("Cleaning up tests.");
      execSync("docker stop vitality_postgres_test && docker rm vitality_postgres_test", { stdio: "ignore" });
   } catch (error) {
      console.error("Error cleaning up tests:", error);
   }
}

if (!(passedTests)) {
   console.error("Some unit tests have failed.");
   process.exit(1);
}