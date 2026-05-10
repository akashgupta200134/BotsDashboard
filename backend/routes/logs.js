const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const logs = await db.all('SELECT * FROM logs ORDER BY started_at DESC LIMIT 100');
    res.json(logs);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.get('/bot/:botId', async (req, res) => {
  try {
    const db = await getDb();
    const logs = await db.all(
      'SELECT * FROM logs WHERE bot_id = ? ORDER BY started_at DESC',
      req.params.botId
    );
    res.json(logs);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM logs WHERE id = ?', req.params.id);
    res.json({ message: 'Log deleted' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;