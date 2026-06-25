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


// GET analytics summary
router.get('/analytics/summary', async (req, res) => {
  try {
    const db = await getDb();

    const totalRuns   = await db.get('SELECT COUNT(*) as count FROM logs');
    const successRuns = await db.get("SELECT COUNT(*) as count FROM logs WHERE status='success'");
    const failedRuns  = await db.get("SELECT COUNT(*) as count FROM logs WHERE status='failed'");

    const byType = await db.all(
      'SELECT bot_type, COUNT(*) as count FROM logs GROUP BY bot_type'
    );

 const byBot = await db.all(`
  SELECT
    b.id          as bot_id,
    b.name        as bot_name,
    b.type        as bot_type,
    COUNT(l.id)   as total,
    SUM(CASE WHEN l.status='success' THEN 1 ELSE 0 END) as success,
    SUM(CASE WHEN l.status='failed'  THEN 1 ELSE 0 END) as failed
  FROM bots b
  LEFT JOIN logs l ON b.id = l.bot_id
  GROUP BY b.id
  ORDER BY total DESC
`);

    const last7Days = await db.all(`
      SELECT
        DATE(started_at) as date,
        COUNT(*) as total,
        SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) as success,
        SUM(CASE WHEN status='failed'  THEN 1 ELSE 0 END) as failed
      FROM logs
      WHERE started_at >= DATE('now', '-7 days')
      GROUP BY DATE(started_at)
      ORDER BY date ASC
    `);

    const avgDuration = await db.get(`
      SELECT ROUND(AVG(
        (JULIANDAY(ended_at) - JULIANDAY(started_at)) * 86400
      ), 1) as avg_seconds
      FROM logs
      WHERE ended_at IS NOT NULL
    `);

    res.json({
      totalRuns:   totalRuns.count,
      successRuns: successRuns.count,
      failedRuns:  failedRuns.count,
      avgDuration: avgDuration.avg_seconds || 0,
      byType,
      byBot,
      last7Days,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// TEMPORARY — delete after running once
router.get('/fix/sync-names', async (req, res) => {
  try {
    const db = await getDb();
    await db.run(`
      UPDATE logs
      SET
        bot_name = (SELECT name FROM bots WHERE bots.id = logs.bot_id),
        bot_type = (SELECT type FROM bots WHERE bots.id = logs.bot_id)
      WHERE bot_id IS NOT NULL
    `);
    const fixed = await db.get('SELECT COUNT(*) as count FROM logs WHERE bot_id IS NOT NULL');
    res.json({ message: `✅ Synced ${fixed.count} log entries to current bot names` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;