const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');

let db;

async function getDb() {
  if (db) return db;

  db = await open({
    filename: path.join(__dirname, 'actify.db'),
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      command TEXT NOT NULL,
      description TEXT DEFAULT '',
      email TEXT DEFAULT '',
      status TEXT DEFAULT 'idle',
      last_run TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bot_id INTEGER,
      bot_name TEXT,
      bot_type TEXT,
      status TEXT,
      output TEXT,
      error TEXT,
      started_at TEXT,
      ended_at TEXT
    );
  `);

  // Seed default user: Akash / 123456
  const existing = await db.get('SELECT * FROM users WHERE username = ?', 'Akash');
  if (!existing) {
    const hashed = bcrypt.hashSync('123456', 10);
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', 'Akash', hashed);
    console.log('✅ Default user created: Akash / 123456');
  }

  // Seed sample bots
  const { count } = await db.get('SELECT COUNT(*) as count FROM bots');
  if (count === 0) {
    const ins = 'INSERT INTO bots (name, type, command, description, email) VALUES (?, ?, ?, ?, ?)';
    await db.run(ins, 'Invoice Processor', 'PAD',        'echo "Invoice Processor running..."', 'Processes daily invoices from SAP', '');
    await db.run(ins, 'HR Data Sync',      'PAD',        'echo "HR Data Sync running..."',       'Syncs HR records to SharePoint',    '');
    await db.run(ins, 'Login Flow Test',   'Playwright', 'echo "Login test running..."',         'Tests login flow on staging site',  '');
    await db.run(ins, 'E2E Checkout',      'Playwright', 'echo "Checkout test running..."',      'End-to-end checkout automation',    '');
    console.log('✅ Sample bots seeded');
  }

  return db;
}

module.exports = { getDb };