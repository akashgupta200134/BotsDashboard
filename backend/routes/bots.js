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
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const isSuccess = status === 'success';
    const statusColor  = isSuccess ? '#16a34a' : '#dc2626';
    const statusBg     = isSuccess ? '#f0fdf4' : '#fef2f2';
    const statusBorder = isSuccess ? '#bbf7d0' : '#fecaca';
    const statusIcon   = isSuccess ? '✅' : '❌';
    const statusLabel  = isSuccess ? 'Completed Successfully' : 'Failed';

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `${statusIcon} Actify — ${botName} ${statusLabel}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);border-radius:16px 16px 0 0;padding:32px;text-align:center">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:12px 20px;margin-bottom:16px">
              <span style="font-size:28px">🤖</span>
            </div>
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px">Actify</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px">Automation Control Room</p>
          </td>
        </tr>

        <!-- Status Banner -->
        <tr>
          <td style="background:${statusBg};border-left:4px solid ${statusColor};border-right:4px solid ${statusColor};padding:20px 32px;text-align:center">
            <span style="font-size:32px">${statusIcon}</span>
            <h2 style="margin:8px 0 4px;color:${statusColor};font-size:20px;font-weight:700">${statusLabel}</h2>
            <p style="margin:0;color:#64748b;font-size:13px">${new Date().toLocaleDateString('en-US',{ weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:32px;border-left:4px solid ${statusColor};border-right:4px solid ${statusColor}">
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
              <tr>
                <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:6px 0;border-bottom:1px solid #f1f5f9">
                        <span style="color:#94a3b8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Bot Name</span><br>
                        <span style="color:#1e293b;font-size:15px;font-weight:600">${botName}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0 6px">
                        <span style="color:#94a3b8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Status</span><br>
                        <span style="display:inline-block;margin-top:4px;background:${statusBg};color:${statusColor};border:1px solid ${statusBorder};border-radius:20px;padding:3px 12px;font-size:12px;font-weight:700">
                          ${statusIcon} ${status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0 0;border-top:1px solid #f1f5f9">
                        <span style="color:#94a3b8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Completed At</span><br>
                        <span style="color:#1e293b;font-size:13px">${new Date().toLocaleString()}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            ${output ? `
            <div style="margin-bottom:8px">
              <span style="color:#94a3b8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">
                ${isSuccess ? '📄 Output' : '⚠️ Error Details'}
              </span>
            </div>
            <div style="background:#0f172a;border-radius:10px;padding:16px;overflow:auto">
              <pre style="margin:0;color:${isSuccess ? '#4ade80' : '#f87171'};font-size:12px;font-family:'Courier New',Courier,monospace;white-space:pre-wrap;word-break:break-all;line-height:1.6">${output}</pre>
            </div>
            ` : ''}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1e293b;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center">
            <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:12px">Sent by <strong style="color:rgba(255,255,255,0.8)">Actify</strong> — Automation Control Room</p>
            <p style="margin:0;color:rgba(255,255,255,0.3);font-size:11px">This is an automated notification. Do not reply to this email.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
      `,
    });

    console.log(`📧 Email sent to ${to} for bot: ${botName} [${status}]`);
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

    // ✅ Sync all old logs to current bot name & type
    await db.run(
      'UPDATE logs SET bot_name=?, bot_type=? WHERE bot_id=?',
      name ?? bot.name,
      type ?? bot.type,
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

    res.json({ message: 'Bot started', status: 'running' });

    exec(bot.command, { timeout: 300000 }, async (error, stdout, stderr) => {
      const endedAt  = new Date().toISOString();
      const status   = error ? 'failed' : 'success';
      const output   = stdout || '';
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