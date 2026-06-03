// routes/impact.js — Returns aggregated impact statistics for the dashboard.
//
// GET /api/impact/summary     → Key numbers (total volunteers, hours, events, etc.)
// GET /api/impact/by-cause    → Breakdown of events by cause (for pie chart)
// GET /api/impact/monthly     → Monthly volunteer hours (for bar/line chart)
// GET /api/impact/top-events  → Top 5 most popular events

const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// ── SUMMARY STATS ─────────────────────────────────────────────────────────────
// Returns the big numbers shown at the top of the dashboard.
router.get('/summary', authenticateToken, (req, res) => {
  // Total unique volunteers (employees who registered for at least one event)
  const totalVolunteers = db.prepare(`
    SELECT COUNT(DISTINCT user_id) AS count FROM registrations
  `).get();

  // Total events created
  const totalEvents = db.prepare(`
    SELECT COUNT(*) AS count FROM events
  `).get();

  // Total volunteering hours = sum of (event duration × registrations for that event)
  const totalHours = db.prepare(`
    SELECT COALESCE(SUM(e.duration_hrs), 0) AS hours
    FROM registrations r
    JOIN events e ON r.event_id = e.id
  `).get();

  // Total registrations
  const totalRegistrations = db.prepare(`
    SELECT COUNT(*) AS count FROM registrations
  `).get();

  // Total companies (unique companies of registered volunteers)
  const totalCompanies = db.prepare(`
    SELECT COUNT(DISTINCT u.company) AS count
    FROM registrations r
    JOIN users u ON r.user_id = u.id
  `).get();

  res.json({
    totalVolunteers: totalVolunteers.count,
    totalEvents: totalEvents.count,
    totalHours: Math.round(totalHours.hours),
    totalRegistrations: totalRegistrations.count,
    totalCompanies: totalCompanies.count
  });
});

// ── BY CAUSE ──────────────────────────────────────────────────────────────────
// Groups events by their cause category.
// Example result: [{ cause: "Environment", count: 5 }, { cause: "Education", count: 3 }]
// Used for the pie chart.
router.get('/by-cause', authenticateToken, (req, res) => {
  const data = db.prepare(`
    SELECT e.cause,
           COUNT(DISTINCT e.id)  AS event_count,
           COUNT(r.id)           AS volunteer_count,
           COALESCE(SUM(e.duration_hrs), 0) AS total_hours
    FROM events e
    LEFT JOIN registrations r ON e.id = r.event_id
    GROUP BY e.cause
    ORDER BY volunteer_count DESC
  `).all();

  res.json(data);
});

// ── MONTHLY HOURS ─────────────────────────────────────────────────────────────
// Returns total volunteering hours grouped by month.
// Used for the bar/line chart to show trend over time.
router.get('/monthly', authenticateToken, (req, res) => {
  const data = db.prepare(`
    SELECT
      strftime('%Y-%m', e.date) AS month,
      COALESCE(SUM(e.duration_hrs), 0) AS total_hours,
      COUNT(r.id) AS volunteer_count
    FROM events e
    LEFT JOIN registrations r ON e.id = r.event_id
    GROUP BY strftime('%Y-%m', e.date)
    ORDER BY month ASC
    LIMIT 12
  `).all();

  res.json(data);
});

// ── TOP EVENTS ────────────────────────────────────────────────────────────────
// Returns top 5 events by number of registrations.
router.get('/top-events', authenticateToken, (req, res) => {
  const data = db.prepare(`
    SELECT e.id, e.title, e.cause, e.date, e.duration_hrs,
           COUNT(r.id) AS registrations
    FROM events e
    LEFT JOIN registrations r ON e.id = r.event_id
    GROUP BY e.id
    ORDER BY registrations DESC
    LIMIT 5
  `).all();

  res.json(data);
});

module.exports = router;
