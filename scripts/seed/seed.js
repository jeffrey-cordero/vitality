require('dotenv').config();
const { surveys } = require('./data');
const { Client } = require('pg');

async function seedSurveys(pool) {
  const query = `
    CREATE TABLE IF NOT EXISTS surveys (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name character varying NOT NULL,
      email character varying NOT NULL,
      message text varying NOT NULL
  );`;

  await pool.query(query);
}

async function seedDatabase(pool) {
  try {
    await Promise.all([seedSurveys(pool)]);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log(process.env.POSTGRES_USER)
    const client = new Client({
      user: process.env.POSTGRES_USER,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DATABASE,
      password: process.env.POSTGRES_PASSWORD,
      port: process.env.POSTGRES_PORT,
    });
    console.log(12);

    // Seed database
    await seedDatabase(client);

    console.log(1);

    const results = await client.query('SELECT * FROM surveys;');
    console.log(results.rows);
    console.log(132);

    await client.end();
  } catch (error) {
    console.error('Error connecting to the database', error);
  }
}

main();
