require("dotenv").config();
const { execSync } = require("child_process");

try {
  console.log("Setting up tests.")
   // Database will be on localhost:5433
   process.env.DATABASE_URL = process.env.DATABASE_TEST_URL;

   // Build and run the Docker image for the database container
   execSync("docker build -t vitality_postgres_test_image .", { stdio: "ignore" },);
   execSync("docker run -d --name vitality_postgres_test -p 5433:5432 vitality_postgres_test_image", { stdio: "ignore" });

    // Run all unit tests with at most 3 retries for potential time-based database conflicts
    let retries = 1;
    
    while (retries <= 3) {
      try {
        execSync("npx jest --collect-coverage", { stdio: "inherit" });
        break;
    } catch (error) {
        console.error(`Error running tests #${retries}:`, error);
    }
  }
} catch (error) {
   console.error("Error setting up tests:", error);
   process.exit(1);
} finally {
   // Cleanup the database container
   try {
    console.log("Cleaning up tests.")
      execSync("docker stop vitality_postgres_test && docker rm vitality_postgres_test", { stdio: "ignore" });
   } catch (error) {
      console.error("Error cleaning up tests:", error);
   }
}
