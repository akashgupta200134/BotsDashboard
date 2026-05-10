const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const nodemailer = require('nodemailer');
const { getDb } = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

async function sendEmail(to, botName, status, output) {
  if (!to || !process.env.EMAIL_USER) return;
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `Actify: ${botName} — ${status.toUpperCase()}`,
      html: `
        <h2>🤖 Actify Bot Notification</h2>
        <p><strong>Bot:</strong> ${botName}</p>
        <p><strong>Status:</strong> <span style="color:${status === 'success' ? 'green' : 'red'}">${status}</span></p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <pre style="background:#f0f0f0;padding:12px;border-radius:6px">${output || 'No output'}</pre>
      `,
    });
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

// GET all bots
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const bots = await db.all('SELECT * FROM bots ORDER BY created_at DESC');
    res.json(bots);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// GET bots by type
router.get('/type/:type', async (req, res) => {
  try {
    const db = await getDb();
    const bots = await db.all('SELECT * FROM bots WHERE type = ? ORDER BY created_at DESC', req.params.type);
    res.json(bots);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// GET single bot
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const bot = await db.get('SELECT * FROM bots WHERE id = ?', req.params.id);
    if (!bot) return res.status(404).json({ message: 'Not found' });
    res.json(bot);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// POST create bot
router.post('/', async (req, res) => {
  try {
    const { name, type, command, description, email } = req.body;
    if (!name || !type || !command) {
      return res.status(400).json({ message: 'name, type, and command are required' });
    }
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO bots (name, type, command, description, email) VALUES (?, ?, ?, ?, ?)',
      name, type, command, description || '', email || ''
    );
    const bot = await db.get('SELECT * FROM bots WHERE id = ?', result.lastID);
    res.status(201).json(bot);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// PUT update bot
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const bot = await db.get('SELECT * FROM bots WHERE id = ?', req.params.id);
    if (!bot) return res.status(404).json({ message: 'Not found' });

    const { name, type, command, description, email } = req.body;
    await db.run(
      'UPDATE bots SET name=?, type=?, command=?, description=?, email=? WHERE id=?',
      name ?? bot.name,
      type ?? bot.type,
      command ?? bot.command,
      description ?? bot.description,
      email ?? bot.email,
      req.params.id
    );
    const updated = await db.get('SELECT * FROM bots WHERE id = ?', req.params.id);
    res.json(updated);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// DELETE bot
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const bot = await db.get('SELECT * FROM bots WHERE id = ?', req.params.id);
    if (!bot) return res.status(404).json({ message: 'Not found' });
    if (bot.status === 'running') return res.status(400).json({ message: 'Cannot delete a running bot' });

    await db.run('DELETE FROM bots WHERE id = ?', req.params.id);
    await db.run('DELETE FROM logs WHERE bot_id = ?', req.params.id);
    res.json({ message: 'Deleted' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// POST run bot
router.post('/:id/run', async (req, res) => {
  try {
    const db = await getDb();
    const bot = await db.get('SELECT * FROM bots WHERE id = ?', req.params.id);
    if (!bot) return res.status(404).json({ message: 'Not found' });
    if (bot.status === 'running') return res.status(400).json({ message: 'Bot is already running' });

    const startedAt = new Date().toISOString();
    await db.run('UPDATE bots SET status=?, last_run=? WHERE id=?', 'running', startedAt, bot.id);

    const logResult = await db.run(
      'INSERT INTO logs (bot_id, bot_name, bot_type, status, started_at) VALUES (?, ?, ?, ?, ?)',
      bot.id, bot.name, bot.type, 'running', startedAt
    );
    const logId = logResult.lastID;

    // Respond immediately — run in background
    res.json({ message: 'Bot started', status: 'running' });

    exec(bot.command, { timeout: 300000 }, async (error, stdout, stderr) => {
      const endedAt = new Date().toISOString();
      const status = error ? 'failed' : 'success';
      const output = stdout || '';
      const errorMsg = stderr || (error ? error.message : '');

      const db2 = await getDb();
      await db2.run('UPDATE bots SET status=?, last_run=? WHERE id=?', status, endedAt, bot.id);
      await db2.run(
        'UPDATE logs SET status=?, output=?, error=?, ended_at=? WHERE id=?',
        status, output, errorMsg, endedAt, logId
      );

      sendEmail(bot.email, bot.name, status, output || errorMsg);
      console.log(`[${bot.name}] finished → ${status}`);
    });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;