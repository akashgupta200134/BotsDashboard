require('dotenv').config();
const express = require('express');
const { getDb } = require('./db');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/bots', require('./routes/bots'));
app.use('/api/logs', require('./routes/logs'));

app.get('/', (req, res) => res.json({ message: '🚀 Actify API running' }));

const PORT = process.env.PORT || 3001;

getDb().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Actify backend running → http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ DB Error:', err);
  process.exit(1);
});