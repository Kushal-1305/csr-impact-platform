# VolunteerTrack — Employee Volunteering & CSR Impact Platform

A full-stack web application for managing corporate volunteering programs, tracking social impact,
and generating ESG metrics. Built as a full-stack portfolio project.

## Features

**For Employees:**
- Browse upcoming volunteering events filtered by cause
- Register or cancel registrations in one click
- View personal registration history

**For CSR Admins:**
- Create, edit, and delete volunteering events
- View registrations per event with volunteer profiles
- Full control over event capacity and scheduling

**Impact Dashboard:**
- Key metrics: total volunteers, hours contributed, events, registrations
- Bar chart: monthly volunteering hours trend
- Pie chart: volunteer distribution across causes
- Top events leaderboard

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS      |
| Charts    | Recharts                          |
| Backend   | Node.js, Express                  |
| Database  | SQLite (better-sqlite3)           |
| Auth      | JWT (jsonwebtoken) + bcrypt       |
| HTTP      | Axios                             |

## Project Structure

```
volunteer-tracker/
├── backend/
│   ├── server.js          # Express app entry point
│   ├── database.js        # SQLite setup & table creation
│   ├── seed.js            # Demo data seeder
│   ├── routes/
│   │   ├── auth.js        # Register, login, /me
│   │   ├── events.js      # CRUD for events
│   │   ├── registrations.js  # Sign up / cancel
│   │   └── impact.js      # Dashboard statistics
│   └── middleware/
│       └── auth.js        # JWT verification middleware
└── frontend/
    └── src/
        ├── api/axios.js        # Axios instance with auth header
        ├── context/AuthContext.jsx  # Global auth state
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Events.jsx      # Employee event browser
        │   ├── AdminPanel.jsx  # Admin event management
        │   └── Dashboard.jsx   # Impact charts
        └── components/
            └── Navbar.jsx
```

## Getting Started

### Prerequisites
- Node.js v20+ ([nodejs.org](https://nodejs.org))

### 1. Backend Setup
```bash
cd backend
npm install
node seed.js        # Populate demo data
node server.js      # Start server on http://localhost:5000
```

### 2. Frontend Setup (new terminal)
```bash
cd frontend
npm install
npm run dev         # Start app on http://localhost:5173
```

### 3. Open the app
Go to [http://localhost:5173](http://localhost:5173)

## Demo Accounts

| Role     | Email                   | Password   |
|----------|-------------------------|------------|
| Admin    | admin@nexavolt.com      | admin123   |
| Employee | alice@nexavolt.com      | pass123    |
| Employee | bob@zyntara.com         | pass123    |

## API Endpoints

| Method | Endpoint                          | Description                  | Auth     |
|--------|-----------------------------------|------------------------------|----------|
| POST   | /api/auth/register                | Create account               | Public   |
| POST   | /api/auth/login                   | Login, receive token         | Public   |
| GET    | /api/auth/me                      | Get current user             | Required |
| GET    | /api/events                       | List all events              | Required |
| POST   | /api/events                       | Create event                 | Admin    |
| PUT    | /api/events/:id                   | Update event                 | Admin    |
| DELETE | /api/events/:id                   | Delete event                 | Admin    |
| POST   | /api/registrations/:eventId       | Register for event           | Required |
| DELETE | /api/registrations/:eventId       | Cancel registration          | Required |
| GET    | /api/registrations/my             | My registrations             | Required |
| GET    | /api/registrations/event/:id      | Volunteers for event         | Admin    |
| GET    | /api/impact/summary               | Key stats                    | Required |
| GET    | /api/impact/by-cause              | Breakdown by cause           | Required |
| GET    | /api/impact/monthly               | Monthly hours trend          | Required |
| GET    | /api/impact/top-events            | Top 5 events                 | Required |
