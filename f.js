const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Check database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Database connected successfully');
  release();
});

// Endpoint to initialize the database schema
app.get('/init-db', async (req, res) => {
  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS session_updates (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMP NOT NULL,
      session_id VARCHAR(255) NOT NULL,
      device_id VARCHAR(255) NOT NULL,
      session_status VARCHAR(50) NOT NULL CHECK (session_status IN ('started', 'stopped'))
    );

    CREATE TABLE IF NOT EXISTS session_updates1 (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMP NOT NULL,
      session_id VARCHAR(255) NOT NULL,
      device_id VARCHAR(255) NOT NULL,
      voltage VARCHAR(255),
      current VARCHAR(255),
      kwh VARCHAR(255),
      session_run_time VARCHAR(255)
    );

    CREATE TABLE IF NOT EXISTS device_commands (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMP NOT NULL,
      request_id VARCHAR(255) NOT NULL,
      device_id VARCHAR(255) NOT NULL,
      command VARCHAR(50) NOT NULL CHECK (command IN ('start', 'stop'))
    );

    CREATE TABLE IF NOT EXISTS device_updates (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMP NOT NULL,
      response_id VARCHAR(255) NOT NULL,
      device_id VARCHAR(255) NOT NULL,
      error_code VARCHAR(50) NOT NULL
    );
  `;

  try {
    await pool.query(createTablesQuery);
    res.status(200).send('Database initialized successfully');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST route to handle session start/stop updates
app.post('/sessionUpdates', async (req, res) => {
  const { timestamp, sessionId, deviceId, sessionStatus } = req.body;
  if (!timestamp || !sessionId || !deviceId || !sessionStatus) {
    return res.status(400).send('Missing required fields');
  }
  try {
    const result = await pool.query(
      'INSERT INTO session_updates (timestamp, session_id, device_id, session_status) VALUES ($1, $2, $3, $4) RETURNING *',
      [timestamp, sessionId, deviceId, sessionStatus]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET route to fetch all session updates
app.get('/sessionUpdates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM session_updates');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST route to handle session updates with additional data
app.post('/sessionUpdates1', async (req, res) => {
  const { timestamp, sessionId, deviceId, voltage, current, kwh, sessionRunTime } = req.body;
  if (!timestamp || !sessionId || !deviceId) {
    return res.status(400).send('Missing required fields');
  }
  try {
    const result = await pool.query(
      'INSERT INTO session_updates1 (timestamp, session_id, device_id, voltage, current, kwh, session_run_time) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [timestamp, sessionId, deviceId, voltage, current, kwh, sessionRunTime]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET route to fetch all session updates with additional data
app.get('/sessionUpdates1', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM session_updates1');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST route to handle device commands
app.post('/deviceId', async (req, res) => {
  const { timestamp, requestId, deviceId, command } = req.body;
  if (!timestamp || !requestId || !deviceId || !command) {
    return res.status(400).send('Missing required fields');
  }
  try {
    const result = await pool.query(
      'INSERT INTO device_commands (timestamp, request_id, device_id, command) VALUES ($1, $2, $3, $4) RETURNING *',
      [timestamp, requestId, deviceId, command]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET route to fetch all device commands
app.get('/deviceId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM device_commands');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST route to handle device updates
app.post('/deviceUpdates', async (req, res) => {
  const { timestamp, responseId, deviceId, errorCode } = req.body;
  if (!timestamp || !responseId || !deviceId || !errorCode) {
    return res.status(400).send('Missing required fields');
  }
  try {
    const result = await pool.query(
      'INSERT INTO device_updates (timestamp, response_id, device_id, error_code) VALUES ($1, $2, $3, $4) RETURNING *',
      [timestamp, responseId, deviceId, errorCode]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET route to fetch all device updates
app.get('/deviceUpdates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM device_updates');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
