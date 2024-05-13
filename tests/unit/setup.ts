require('dotenv').config();
const { execSync } = require('child_process');

try {
  // Database will be on localhost
  process.env.DATABASE_URL = process.env.DATABASE_TEST_URL;

  // Build and run the Docker image for the database container
  execSync('docker build -t vitality_postgres_test_image .', { stdio: 'inherit' });

  execSync('docker run -d --name vitality_postgres_test -p 5432:5432 vitality_postgres_test_image', { stdio: 'inherit' });
  
  // Run all unit tests
  try {
    execSync('npx jest', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error running tests:', error);
  }
} catch (error) {
  console.error('Error setting up tests:', error);
  process.exit(1);
} finally {
  // Cleanup the database container
  try {
    execSync('docker stop vitality_postgres_test && docker rm vitality_postgres_test', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error cleaning up tests:', error);
  }
}
