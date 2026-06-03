// routes/auth.js — Handles user registration and login.
//
// POST /api/auth/register → Create a new account
// POST /api/auth/login    → Log in and receive a JWT token
// GET  /api/auth/me       → Get current logged-in user's info

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// ── REGISTER ──────────────────────────────────────────────────────────────────
// Creates a new user account.
// Steps: validate input → check email not taken → hash password → save to DB → return token
router.post('/register', (req, res) => {
  const { name, email, password, company, role } = req.body;

  // Basic validation — make sure required fields are provided
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  // Check if email already exists in the database
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingUser) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  // Hash the password before saving (10 = "salt rounds", higher = more secure but slower)
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Insert the new user into the database
  const result = db.prepare(`
    INSERT INTO users (name, email, password, company, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, email, hashedPassword, company || 'NexaVolt', role || 'employee');

  // Create a JWT token for the new user so they're immediately logged in
  const token = jwt.sign(
    { id: result.lastInsertRowid, name, email, role: role || 'employee' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );

  res.status(201).json({
    message: 'Account created successfully!',
    token,
    user: { id: result.lastInsertRowid, name, email, role: role || 'employee', company: company || 'NexaVolt' }
  });
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
// Checks credentials and returns a JWT token if correct.
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Find the user by email
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Compare the entered password with the hashed password in the DB
  // bcrypt.compareSync handles the decryption internally
  const passwordMatch = bcrypt.compareSync(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Generate a JWT token
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    message: 'Login successful!',
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, company: user.company }
  });
});

// ── GET CURRENT USER ──────────────────────────────────────────────────────────
// Returns the logged-in user's profile. Protected — requires a valid token.
router.get('/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, company, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
});

module.exports = router;
