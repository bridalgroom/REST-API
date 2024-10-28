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

// POST route to handle session start/stop updates
app.post('/sessionUpdate', async (req, res) => {
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

// POST route to handle session updates with additional data
app.post('/sessionUpdate1', async (req, res) => {
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
app.get('/sessionUpdates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM session_updates');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/sessionUpdates1', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM session_updates1');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/deviceId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM device_commands');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
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
