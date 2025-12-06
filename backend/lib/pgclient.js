require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 3,                  // keep very low on Render free tier
  idleTimeoutMillis: 5000, // close idle connections quickly
  connectionTimeoutMillis: 8000
});

module.exports = pool;
