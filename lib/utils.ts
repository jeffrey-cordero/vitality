require("dotenv").config();
const { Client } = require('pg');

export async function createClient(): Promise<typeof Client> {
   return new Client({
     user: process.env.POSTGRES_USER,
     host: process.env.POSTGRES_HOST,
     database: process.env.POSTGRES_DATABASE,
     password: process.env.POSTGRES_PASSWORD,
     port: process.env.POSTGRES_PORT
   });
}
