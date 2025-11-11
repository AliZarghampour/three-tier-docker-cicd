const express = require('express');
const { Pool } = require('pg');
const client = require('prom-client');

const app = express();
app.use(express.json());
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [50, 100, 200, 500, 1000]
});
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://user:pass@db:5432/taskflow'
});
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/tasks', async (req, res) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  try {
    const { rows } = await pool.query('SELECT id, title, completed FROM tasks ORDER BY id');
    end({ method: req.method, route: req.path, status_code: 200 });
    res.json(rows);
  } catch (err) {
    end({ method: req.method, route: req.path, status_code: 500 });
    res.status(500).json({ error: 'DB error' });
  }
});
app.post('/tasks', async (req, res) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  const { title } = req.body;
  if (!title) {
    end({ method: req.method, route: req.path, status_code: 400 });
    return res.status(400).json({ error: 'title required' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, completed',
      [title]
    );
    end({ method: req.method, route: req.path, status_code: 201 });
    res.status(201).json(rows[0]);
  } catch (err) {
    end({ method: req.method, route: req.path, status_code: 500 });
    res.status(500).json({ error: 'DB error' });
  }
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`backend listening ${port}`));
