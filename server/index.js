import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const db = new Database('calendar.db');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    color TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0,
    is_super_user INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start TEXT NOT NULL,
    end TEXT NOT NULL,
    created_by TEXT NOT NULL,
    color TEXT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS holidays (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date TEXT NOT NULL
  );
`);

// Initialize admin user if not exists
const adminExists = db.prepare('SELECT id FROM users WHERE id = ?').get('admin');
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare(`
    INSERT INTO users (id, name, password, color, is_admin, is_super_user)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('admin', 'Rendszergazda', hashedPassword, '#9333FF', 1, 1);
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/login', (req, res) => {
  const { id, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { 
      id: user.id,
      name: user.name,
      color: user.color,
      isAdmin: Boolean(user.is_admin),
      isSuperUser: Boolean(user.is_super_user)
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );

  res.json({ token });
});

// User routes
app.get('/api/users', authenticateToken, (req, res) => {
  const users = db.prepare('SELECT id, name, color, is_admin, is_super_user FROM users').all();
  res.json(users);
});

app.post('/api/users', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin rights required' });
  }

  const { id, name, password, color, isAdmin } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    db.prepare(`
      INSERT INTO users (id, name, password, color, is_admin)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, hashedPassword, color, isAdmin ? 1 : 0);
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Event routes
app.get('/api/events', authenticateToken, (req, res) => {
  const events = db.prepare('SELECT * FROM events').all();
  res.json(events);
});

app.post('/api/events', authenticateToken, (req, res) => {
  const { title, description, start, end, color } = req.body;
  const id = crypto.randomUUID();

  try {
    db.prepare(`
      INSERT INTO events (id, title, description, start, end, created_by, color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, description, start, end, req.user.id, color);
    res.status(201).json({ id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/events/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  if (event.created_by !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Permission denied' });
  }

  const { title, description, start, end, color } = req.body;

  try {
    db.prepare(`
      UPDATE events
      SET title = ?, description = ?, start = ?, end = ?, color = ?
      WHERE id = ?
    `).run(title, description, start, end, color, id);
    res.json({ message: 'Event updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/events/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  if (event.created_by !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Permission denied' });
  }

  db.prepare('DELETE FROM events WHERE id = ?').run(id);
  res.json({ message: 'Event deleted' });
});

// Holiday routes
app.get('/api/holidays', authenticateToken, (req, res) => {
  const holidays = db.prepare('SELECT * FROM holidays').all();
  res.json(holidays);
});

app.post('/api/holidays', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin rights required' });
  }

  const { name, date } = req.body;
  const id = crypto.randomUUID();

  try {
    db.prepare(`
      INSERT INTO holidays (id, name, date)
      VALUES (?, ?, ?)
    `).run(id, name, date);
    res.status(201).json({ id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});