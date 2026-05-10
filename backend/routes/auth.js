const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db');

router.post('/login', async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { username, password } = req.body;

    const db = await getDb();

    console.log("DB CONNECTED");

    const user = await db.get(
      'SELECT * FROM users WHERE username = ?',
      username
    );

    console.log("USER:", user);

    if (!user) {
      return res.status(401).json({
        message: 'User not found'
      });
    }

    const valid = bcrypt.compareSync(password, user.password);

    console.log("PASSWORD MATCH:", valid);

    if (!valid) {
      return res.status(401).json({
        message: 'Invalid password'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '8h'
      }
    );

    console.log("TOKEN CREATED");

    res.json({
      token,
      username: user.username
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    res.status(500).json({
      message: 'Server error'
    });
  }
});

module.exports = router;