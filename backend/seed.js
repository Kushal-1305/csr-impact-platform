// seed.js — Populates the database with realistic demo data.
// Run with: node seed.js
//
// Creates:
//   - 1 admin user (CSR Manager at NexaVolt)
//   - 5 employee users (from different fictional companies)
//   - 10 volunteering events across different causes and months
//   - 25+ registrations spread across events

const bcrypt = require('bcryptjs');

// Requiring database.js runs it, which creates all tables if they don't exist
const db = require('./database');

// ─── CLEAR EXISTING DATA ──────────────────────────────────────────────────────
// Start fresh each time seed is run
db.exec(`DELETE FROM registrations; DELETE FROM events; DELETE FROM users;`);
console.log('Cleared existing data.');

// ─── USERS ────────────────────────────────────────────────────────────────────
const hash = (p) => bcrypt.hashSync(p, 10);

const users = [
  { name: 'Sarah Admin',   email: 'admin@nexavolt.com',  password: hash('admin123'), company: 'NexaVolt', role: 'admin' },
  { name: 'Alice Johnson', email: 'alice@nexavolt.com',  password: hash('pass123'),  company: 'NexaVolt', role: 'employee' },
  { name: 'Bob Martinez',  email: 'bob@zyntara.com',     password: hash('pass123'),  company: 'Zyntara',  role: 'employee' },
  { name: 'Carol Singh',   email: 'carol@orbivex.com',   password: hash('pass123'),  company: 'Orbivex',  role: 'employee' },
  { name: 'David Patel',   email: 'david@lumecorp.com',  password: hash('pass123'),  company: 'Lumecorp', role: 'employee' },
  { name: 'Eva Chen',      email: 'eva@trioniq.com',     password: hash('pass123'),  company: 'Trioniq',  role: 'employee' },
];

const insertUser = db.prepare(`
  INSERT INTO users (name, email, password, company, role) VALUES (?, ?, ?, ?, ?)
`);

const userIds = [];
for (const u of users) {
  const res = insertUser.run(u.name, u.email, u.password, u.company, u.role);
  userIds.push(res.lastInsertRowid);
  console.log(`  ✓ Created user: ${u.name} (${u.role})`);
}

const adminId = userIds[0];

// ─── EVENTS ───────────────────────────────────────────────────────────────────
const events = [
  {
    title: 'City Park Tree Plantation Drive',
    description: 'Join us to plant 500 saplings in the city park and restore green cover. Gloves and tools provided.',
    cause: 'Environment', location: 'City Park, Bangalore', date: '2026-06-15', duration_hrs: 4, max_volunteers: 30
  },
  {
    title: 'Food Bank Packing Day',
    description: 'Help sort and pack food donations for 200 underprivileged families ahead of the monsoon season.',
    cause: 'Food', location: 'Community Center, HSR Layout', date: '2026-06-20', duration_hrs: 3, max_volunteers: 20
  },
  {
    title: 'Digital Literacy Workshop for Seniors',
    description: 'Teach basic smartphone and internet skills to senior citizens at the old age home.',
    cause: 'Technology', location: 'Sunset Home, Koramangala', date: '2026-06-28', duration_hrs: 3, max_volunteers: 15
  },
  {
    title: 'Beach Cleanup at Juhu',
    description: 'Mass cleanup drive to collect plastic waste and marine debris from Juhu Beach.',
    cause: 'Environment', location: 'Juhu Beach, Mumbai', date: '2026-07-05', duration_hrs: 5, max_volunteers: 50
  },
  {
    title: 'Free Health Checkup Camp',
    description: 'Assist doctors in providing free health screenings (BP, sugar, BMI) to 300+ residents.',
    cause: 'Health', location: 'Dharavi Community Hall, Mumbai', date: '2026-07-12', duration_hrs: 6, max_volunteers: 25
  },
  {
    title: 'School Library Renovation',
    description: 'Paint classrooms, build bookshelves, and donate 200+ books to a government school.',
    cause: 'Education', location: 'Govt. Primary School, Whitefield', date: '2026-07-19', duration_hrs: 8, max_volunteers: 20
  },
  {
    title: 'Animal Shelter Care Day',
    description: 'Spend the day at the city animal shelter — bathe, feed, and play with rescued dogs and cats.',
    cause: 'Animals', location: 'City Animal Shelter, Yelahanka', date: '2026-07-26', duration_hrs: 4, max_volunteers: 12
  },
  {
    title: 'Neighborhood Clean-Up Drive',
    description: 'Join neighbors to clean streets, paint walls, and plant flowers in our locality.',
    cause: 'Community', location: 'Indiranagar, Bangalore', date: '2026-05-10', duration_hrs: 3, max_volunteers: 40
  },
  {
    title: 'Coding Bootcamp for Underprivileged Youth',
    description: 'Teach basic HTML/CSS/Python to 30 underprivileged students over a weekend.',
    cause: 'Education', location: 'Jagriti NGO, Pune', date: '2026-05-24', duration_hrs: 16, max_volunteers: 10
  },
  {
    title: 'River Cleaning Initiative',
    description: 'Remove solid waste and debris from the Musi River banks as part of the Clean India Mission.',
    cause: 'Environment', location: 'Musi River Bank, Hyderabad', date: '2026-04-22', duration_hrs: 5, max_volunteers: 60
  },
];

const insertEvent = db.prepare(`
  INSERT INTO events (title, description, cause, location, date, duration_hrs, max_volunteers, created_by)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const eventIds = [];
for (const e of events) {
  const res = insertEvent.run(e.title, e.description, e.cause, e.location, e.date, e.duration_hrs, e.max_volunteers, adminId);
  eventIds.push(res.lastInsertRowid);
  console.log(`  ✓ Created event: ${e.title}`);
}

// ─── REGISTRATIONS ────────────────────────────────────────────────────────────
// Spread registrations realistically across events and employees
const employeeIds = userIds.slice(1); // All users except admin

const registrationPairs = [
  [employeeIds[0], eventIds[0]],
  [employeeIds[0], eventIds[1]],
  [employeeIds[0], eventIds[4]],
  [employeeIds[0], eventIds[7]],
  [employeeIds[0], eventIds[9]],
  [employeeIds[1], eventIds[0]],
  [employeeIds[1], eventIds[2]],
  [employeeIds[1], eventIds[3]],
  [employeeIds[1], eventIds[8]],
  [employeeIds[2], eventIds[1]],
  [employeeIds[2], eventIds[4]],
  [employeeIds[2], eventIds[5]],
  [employeeIds[2], eventIds[9]],
  [employeeIds[3], eventIds[0]],
  [employeeIds[3], eventIds[3]],
  [employeeIds[3], eventIds[6]],
  [employeeIds[3], eventIds[7]],
  [employeeIds[4], eventIds[2]],
  [employeeIds[4], eventIds[5]],
  [employeeIds[4], eventIds[8]],
  [employeeIds[4], eventIds[9]],
];

const insertReg = db.prepare(`
  INSERT OR IGNORE INTO registrations (user_id, event_id) VALUES (?, ?)
`);

for (const [userId, eventId] of registrationPairs) {
  insertReg.run(userId, eventId);
}
console.log(`  ✓ Created ${registrationPairs.length} registrations.`);

console.log('\n✅ Seed complete! Database is ready.');
console.log('\nDemo login credentials:');
console.log('  Admin:    admin@nexavolt.com / admin123');
console.log('  Employee: alice@nexavolt.com / pass123');
