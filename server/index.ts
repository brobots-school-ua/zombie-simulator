import express from 'express';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

// Serve built frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '../dist');
  app.use(express.static(distPath));
}

const prisma = new PrismaClient();

// GET /api/profile/:name — load profile
app.get('/api/profile/:name', async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { name: req.params.name.toLowerCase() },
    });
    res.json(profile ? profile.data : null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// POST /api/profile/:name — save profile
app.post('/api/profile/:name', async (req, res) => {
  try {
    await prisma.profile.upsert({
      where: { name: req.params.name.toLowerCase() },
      update: { data: req.body },
      create: { name: req.params.name.toLowerCase(), data: req.body },
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
app.listen(PORT, '::', () => {
  console.log(`Server running on port ${PORT}`);
});
