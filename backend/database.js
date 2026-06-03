// database.js — This file sets up our SQLite database.
// SQLite stores everything in a single file (volunteer.db) on your computer.
// No need to install a separate database server like MySQL or PostgreSQL.

const Database = require('better-sqlite3');
const path = require('path');

// Create (or open) the database file
const db = new Database(path.join(__dirname, 'volunteer.db'));

// Enable WAL mode — makes reads and writes faster
db.pragma('journal_mode = WAL');

// ─── CREATE TABLES ───────────────────────────────────────────────────────────
// "IF NOT EXISTS" means: only create the table if it doesn't already exist.
// This prevents errors when we restart the server.

// TABLE 1: users
// Stores everyone who creates an account.
// role can be 'employee' or 'admin'
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL,
    email     TEXT    NOT NULL UNIQUE,
    password  TEXT    NOT NULL,
    company   TEXT    NOT NULL DEFAULT 'NexaVolt',
    role      TEXT    NOT NULL DEFAULT 'employee',
    created_at TEXT   DEFAULT (datetime('now'))
  );
`);

// TABLE 2: events
// Stores volunteering events created by admins.
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT    NOT NULL,
    description   TEXT,
    cause         TEXT    NOT NULL,
    location      TEXT    NOT NULL,
    date          TEXT    NOT NULL,
    duration_hrs  REAL    NOT NULL DEFAULT 2,
    max_volunteers INTEGER NOT NULL DEFAULT 50,
    created_by    INTEGER NOT NULL,
    created_at    TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );
`);

// TABLE 3: registrations
// Stores which employee signed up for which event.
// One row = one person signed up for one event.
db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    event_id   INTEGER NOT NULL,
    status     TEXT    NOT NULL DEFAULT 'registered',
    registered_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, event_id),
    FOREIGN KEY (user_id)  REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
  );
`);

console.log('Database connected and tables ready.');

module.exports = db;
