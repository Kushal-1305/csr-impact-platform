// routes/events.js — CRUD operations for volunteering events.
//
// GET    /api/events        → List all events (with registration count)
// GET    /api/events/:id    → Get a single event's details
// POST   /api/events        → Create a new event (admin only)
// PUT    /api/events/:id    → Update an event (admin only)
// DELETE /api/events/:id    → Delete an event (admin only)

const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// ── GET ALL EVENTS ────────────────────────────────────────────────────────────
// Returns all events, sorted by date (upcoming first).
// Also returns how many people have registered for each event.
router.get('/', authenticateToken, (req, res) => {
  const events = db.prepare(`
    SELECT
      e.*,
      u.name AS created_by_name,
      COUNT(r.id) AS registered_count
    FROM events e
    LEFT JOIN users u ON e.created_by = u.id
    LEFT JOIN registrations r ON e.id = r.event_id
    GROUP BY e.id
    ORDER BY e.date ASC
  `).all();

  res.json(events);
});

// ── GET SINGLE EVENT ──────────────────────────────────────────────────────────
router.get('/:id', authenticateToken, (req, res) => {
  const event = db.prepare(`
    SELECT e.*, u.name AS created_by_name,
           COUNT(r.id) AS registered_count
    FROM events e
    LEFT JOIN users u ON e.created_by = u.id
    LEFT JOIN registrations r ON e.id = r.event_id
    WHERE e.id = ?
    GROUP BY e.id
  `).get(req.params.id);

  if (!event) return res.status(404).json({ error: 'Event not found.' });
  res.json(event);
});

// ── CREATE EVENT ──────────────────────────────────────────────────────────────
// Only admins can create events.
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const { title, description, cause, location, date, duration_hrs, max_volunteers } = req.body;

  if (!title || !cause || !location || !date) {
    return res.status(400).json({ error: 'Title, cause, location, and date are required.' });
  }

  const result = db.prepare(`
    INSERT INTO events (title, description, cause, location, date, duration_hrs, max_volunteers, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title,
    description || '',
    cause,
    location,
    date,
    duration_hrs || 2,
    max_volunteers || 50,
    req.user.id
  );

  const newEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ message: 'Event created successfully!', event: newEvent });
});

// ── UPDATE EVENT ──────────────────────────────────────────────────────────────
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { title, description, cause, location, date, duration_hrs, max_volunteers } = req.body;

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found.' });

  db.prepare(`
    UPDATE events
    SET title = ?, description = ?, cause = ?, location = ?,
        date = ?, duration_hrs = ?, max_volunteers = ?
    WHERE id = ?
  `).run(
    title || event.title,
    description !== undefined ? description : event.description,
    cause || event.cause,
    location || event.location,
    date || event.date,
    duration_hrs || event.duration_hrs,
    max_volunteers || event.max_volunteers,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  res.json({ message: 'Event updated successfully!', event: updated });
});

// ── DELETE EVENT ──────────────────────────────────────────────────────────────
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found.' });

  // Also delete all registrations for this event (cleanup)
  db.prepare('DELETE FROM registrations WHERE event_id = ?').run(req.params.id);
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);

  res.json({ message: 'Event deleted successfully.' });
});

module.exports = router;
