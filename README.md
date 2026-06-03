# CSR Impact Platform — Employee Volunteering & Social Impact Tracker

A web application that helps companies manage their Corporate Social Responsibility (CSR) programs — making it easy for employees to volunteer, and for managers to track the real-world impact their organization is creating.

---

## The Problem It Solves

Most companies have CSR goals — getting employees to volunteer, support causes, and contribute to ESG (Environmental, Social, Governance) targets. But managing this is messy: events are announced over email, sign-ups are tracked in spreadsheets, and nobody really knows the total impact being made.

This platform fixes that by giving companies a single place to organize volunteering, track participation, and visualize their social impact — all in real time.

---

## Who Uses It

### Employees
- Log in and see all upcoming volunteering events at a glance
- Filter events by cause — Environment, Education, Health, Food, and more
- Register for events with one click, and cancel if plans change
- See how many spots are left on each event before signing up

### CSR Managers (Admins)
- Create and publish new volunteering events with all details (date, location, cause, capacity)
- Edit or remove events at any time
- See exactly who has signed up for each event
- Monitor how participation is trending across the organization

---

## The Impact Dashboard

The most powerful part of the platform. It answers the question: *"What difference are we actually making?"*

- **Total volunteers** engaged across all events
- **Total hours** contributed by employees
- **Monthly trend chart** showing how volunteering activity grows over time
- **Cause breakdown chart** showing which areas (environment, education, etc.) get the most engagement
- **Top events leaderboard** — the most popular volunteering drives

This is the kind of data that goes into ESG reports submitted to investors and boards.

---

## How to Run It Locally

You'll need [Node.js](https://nodejs.org) installed.

**Start the backend** (open a terminal in the `backend/` folder):
```bash
npm install
node seed.js
node server.js
```

**Start the frontend** (open another terminal in the `frontend/` folder):
```bash
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

**Demo login credentials:**

| Role | Email | Password |
|------|-------|----------|
| Admin (CSR Manager) | admin@nexavolt.com | admin123 |
| Employee | alice@nexavolt.com | pass123 |
| Employee | bob@zyntara.com | pass123 |

---

## Built With

- **Frontend:** React, Tailwind CSS, Recharts (for charts)
- **Backend:** Node.js, Express
- **Database:** SQLite
- **Authentication:** JWT-based login with encrypted passwords
