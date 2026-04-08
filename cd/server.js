require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Database setup ──
const db = new Database(path.join(__dirname, 'contacts.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL,
    email     TEXT    NOT NULL,
    project_type TEXT,
    message   TEXT    NOT NULL,
    created_at TEXT   DEFAULT (datetime('now'))
  )
`);

const insertContact = db.prepare(
  `INSERT INTO contacts (name, email, project_type, message) VALUES (?, ?, ?, ?)`
);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── Email transporter ──
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── POST /contact — save to DB + send email ──
app.post('/contact', async (req, res) => {
  const { name, email, projectType, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  // Save to database
  try {
    insertContact.run(name, email, projectType || null, message);
  } catch (dbErr) {
    console.error('DB error:', dbErr.message);
    return res.status(500).json({ error: 'Failed to save message.' });
  }

  // Send email
  try {
    await transporter.sendMail({
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: `New Project Inquiry from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Project Type:</strong> ${projectType || 'Not specified'}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    });
  } catch (mailErr) {
    console.error('Email error:', mailErr.message);
    // Still respond OK since DB save succeeded
    return res.json({ success: true, message: 'Message saved. Email delivery failed.' });
  }

  res.json({ success: true, message: 'Message sent and saved successfully!' });
});

// ── GET /contacts — retrieve all submissions ──
app.get('/contacts', (req, res) => {
  const rows = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
  res.json({ success: true, data: rows });
});

// ── GET /contacts/:id — retrieve single submission ──
app.get('/contacts/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Contact not found.' });
  res.json({ success: true, data: row });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
