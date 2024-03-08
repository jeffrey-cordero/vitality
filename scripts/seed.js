import { createClient } from "../lib/utils.ts";
const { data } = require('../lib/placeholder-data.js');

async function seedDatabase(client) {
  try {
    await client.sql`CREATE TABLE TODO`;
    console.log(data);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

async function main() {
  try {
    const client = await createClient();
    await client.connect();

    // Seed database
    await seedDatabase(client);

    // Break connection
    await client.end();
  } catch (error) {
    console.error('Error connecting to the database', error);
  }
}

main();
