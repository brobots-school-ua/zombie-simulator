import express from 'express';
import { Pool } from 'pg';

const app = express();
app.use(express.json());

// Allow requests from Vite dev server
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.sendStatus(200); return; }
  next();
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://student_admin:vibecode2026pg@172.17.0.1:5433/db_nikitad',
});

// Create table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS profiles (
    name TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
  )
`).catch(console.error);

// GET /api/profile/:name — load profile
app.get('/api/profile/:name', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT data FROM profiles WHERE name = $1',
      [req.params.name.toLowerCase()]
    );
    if (rows.length === 0) {
      res.json(null);
    } else {
      res.json(rows[0].data);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// POST /api/profile/:name — save profile
app.post('/api/profile/:name', async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO profiles (name, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (name) DO UPDATE SET data = $2, updated_at = NOW()`,
      [req.params.name.toLowerCase(), req.body]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

const PORT = 3001;
app.listen(PORT, '::', () => {
  console.log(`Profile API running on port ${PORT}`);
});
