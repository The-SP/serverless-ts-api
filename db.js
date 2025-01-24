import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pg;

const client = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

client.connect();

export default client;
