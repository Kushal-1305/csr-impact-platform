// routes/registrations.js — Handles signing up and withdrawing from events.
//
// POST   /api/registrations/:eventId   → Register for an event
// DELETE /api/registrations/:eventId   → Cancel registration
// GET    /api/registrations/my         → Get all events the current user registered for
// GET    /api/registrations/event/:id  → Get all registrations for an event (admin)

const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// ── MY REGISTRATIONS ──────────────────────────────────────────────────────────
// Returns all events a logged-in user has signed up for.
// We use JOIN to get the event details alongside the registration.
router.get('/my', authenticateToken, (req, res) => {
  const registrations = db.prepare(`
    SELECT r.id AS registration_id, r.status, r.registered_at,
           e.id AS event_id, e.title, e.cause, e.location,
           e.date, e.duration_hrs, e.description
    FROM registrations r
    JOIN events e ON r.event_id = e.id
    WHERE r.user_id = ?
    ORDER BY e.date ASC
  `).all(req.user.id);

  res.json(registrations);
});

// ── GET REGISTRATIONS FOR AN EVENT ───────────────────────────────────────────
// Admins can see who signed up for a specific event.
router.get('/event/:eventId', authenticateToken, requireAdmin, (req, res) => {
  const registrations = db.prepare(`
    SELECT r.id, r.status, r.registered_at,
           u.id AS user_id, u.name, u.email, u.company
    FROM registrations r
    JOIN users u ON r.user_id = u.id
    WHERE r.event_id = ?
    ORDER BY r.registered_at ASC
  `).all(req.params.eventId);

  res.json(registrations);
});

// ── REGISTER FOR AN EVENT ─────────────────────────────────────────────────────
// Adds the current user to an event.
// Checks: event exists, not already registered, event not full.
router.post('/:eventId', authenticateToken, (req, res) => {
  const eventId = req.params.eventId;

  // Check if the event exists
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
  if (!event) return res.status(404).json({ error: 'Event not found.' });

  // Check if already registered (UNIQUE constraint in DB also prevents this)
  const existing = db.prepare(
    'SELECT id FROM registrations WHERE user_id = ? AND event_id = ?'
  ).get(req.user.id, eventId);
  if (existing) return res.status(409).json({ error: 'You are already registered for this event.' });

  // Check if event is full
  const count = db.prepare(
    'SELECT COUNT(*) AS cnt FROM registrations WHERE event_id = ?'
  ).get(eventId);
  if (count.cnt >= event.max_volunteers) {
    return res.status(400).json({ error: 'This event is full.' });
  }

  db.prepare(
    'INSERT INTO registrations (user_id, event_id) VALUES (?, ?)'
  ).run(req.user.id, eventId);

  res.status(201).json({ message: `Successfully registered for "${event.title}"!` });
});

// ── CANCEL REGISTRATION ───────────────────────────────────────────────────────
router.delete('/:eventId', authenticateToken, (req, res) => {
  const result = db.prepare(
    'DELETE FROM registrations WHERE user_id = ? AND event_id = ?'
  ).run(req.user.id, req.params.eventId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Registration not found.' });
  }

  res.json({ message: 'Registration cancelled successfully.' });
});

module.exports = router;
