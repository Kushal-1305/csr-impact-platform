// middleware/auth.js — The "security guard" for protected routes.
//
// How JWT auth works:
// 1. User logs in → server gives them a token (like a wristband)
// 2. User sends that token with every future request (in the "Authorization" header)
// 3. This middleware checks if the token is valid before letting the request through
// 4. If valid → attaches user info to req.user and moves on
// 5. If invalid/missing → returns 401 Unauthorized

const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // The token is sent in the header like: "Bearer eyJhbGci..."
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract just the token part

  if (!token) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  try {
    // Verify the token using our secret key
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user; // Attach user info (id, role) to the request
    next();          // Move on to the actual route handler
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

// Extra middleware: only allows admins through
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin };
