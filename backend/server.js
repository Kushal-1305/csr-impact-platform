// server.js — The entry point of our backend.
// This file starts the Express web server and wires everything together.

require('dotenv').config(); // Load .env variables (PORT, JWT_SECRET)
const express = require('express');
const cors = require('cors');

const app = express(); // Create the Express app (our web server)

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
// Middleware = functions that run on EVERY request before it reaches a route.

// cors: Allows our React app (running on port 3000) to talk to this server (port 5000).
// Without this, browsers block cross-origin requests for security reasons.
app.use(cors({ origin: 'http://localhost:5173' }));

// express.json(): Lets the server understand JSON data sent in request bodies.
// Without this, req.body would be undefined.
app.use(express.json());

// ─── ROUTES ──────────────────────────────────────────────────────────────────
// Routes = the different "endpoints" users can call.
// We split them into separate files to keep things organized.

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/events',        require('./routes/events'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/impact',        require('./routes/impact'));

// Health check — a simple route to confirm the server is running
app.get('/', (req, res) => {
  res.json({ message: 'Volunteer Tracker API is running!' });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
