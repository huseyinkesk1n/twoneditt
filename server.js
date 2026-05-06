const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'twon_super_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Simple Auth Middleware
const requireAuth = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Database path
const dbPath = path.join(__dirname, 'database.json');
const msgPath = path.join(__dirname, 'messages.json');

// --- API ROUTES ---

// Get Data
app.get('/api/data', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Database read error' });
    res.json(JSON.parse(data));
  });
});

// Save Data (Protected)
app.post('/api/data', requireAuth, (req, res) => {
  const newData = req.body;
  fs.writeFile(dbPath, JSON.stringify(newData, null, 2), 'utf8', (err) => {
    if (err) return res.status(500).json({ error: 'Database write error' });
    res.json({ success: true, message: 'Data saved successfully' });
  });
});

// Get Messages (Protected)
app.get('/api/messages', requireAuth, (req, res) => {
  fs.readFile(msgPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Messages read error' });
    res.json(JSON.parse(data || '[]'));
  });
});

// Post Message (Public)
app.post('/api/messages', (req, res) => {
  const newMsg = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    ...req.body
  };
  fs.readFile(msgPath, 'utf8', (err, data) => {
    let messages = [];
    if (!err && data) {
      try { messages = JSON.parse(data); } catch (e) {}
    }
    messages.unshift(newMsg); // Add to beginning
    fs.writeFile(msgPath, JSON.stringify(messages, null, 2), 'utf8', (err) => {
      if (err) return res.status(500).json({ error: 'Message save error' });
      res.json({ success: true, message: 'Message sent successfully' });
    });
  });
});

// Delete Message (Protected)
app.delete('/api/messages/:id', requireAuth, (req, res) => {
  fs.readFile(msgPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Messages read error' });
    let messages = JSON.parse(data || '[]');
    messages = messages.filter(m => m.id !== req.params.id);
    fs.writeFile(msgPath, JSON.stringify(messages, null, 2), 'utf8', (err) => {
      if (err) return res.status(500).json({ error: 'Message delete error' });
      res.json({ success: true });
    });
  });
});

// --- ADMIN & LOGIN ROUTES ---

app.get('/login', (req, res) => {
  if (req.session.loggedIn) return res.redirect('/admin');
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Hardcoded simple auth for now
  if (username === 'admin' && password === 'twon123') {
    req.session.loggedIn = true;
    res.redirect('/admin');
  } else {
    res.redirect('/login?error=1');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/admin', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Sunucu başlatıldı! Ana site: http://localhost:${PORT}`);
  console.log(`Admin Paneli: http://localhost:${PORT}/admin`);
});
