const express = require('express');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORT = process.env.PORT || 8080;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'scientist2026';

const db = new DatabaseSync(path.join(__dirname, 'database.sqlite'));

// Ensure DB Tables exist
db.exec(`
  CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    course TEXT NOT NULL,
    title TEXT NOT NULL,
    time_limit INTEGER DEFAULT 60
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id TEXT NOT NULL,
    q TEXT NOT NULL,
    a TEXT NOT NULL,
    b TEXT NOT NULL,
    c TEXT NOT NULL,
    d TEXT NOT NULL,
    correct TEXT NOT NULL,
    explanation TEXT
  );
`);

app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  if (req.path === '/admin.html') {
    return res.status(404).send('Not Found');
  }
  next();
});

app.use(express.static(path.join(__dirname)));

function checkAdminAuth(req, res, next) {
  const authHeader = req.headers['x-admin-password'];
  if (authHeader === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid Admin Password' });
  }
}

app.get('/ezr-admin-vault-x98k.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'ezr-admin-vault-x98k.html'));
});

app.post('/api/admin/verify', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Authentication successful.' });
  } else {
    res.status(401).json({ success: false, error: 'Invalid password.' });
  }
});

// GET all modules with questions
app.get('/api/questions', (req, res) => {
  try {
    const modules = db.prepare('SELECT * FROM modules').all();
    const getQuestions = db.prepare('SELECT * FROM questions WHERE module_id = ?');

    const result = modules.map(mod => ({
      id: mod.id,
      course: mod.course,
      title: mod.title,
      timeLimit: mod.time_limit,
      questions: getQuestions.all(mod.id).map(q => ({
        id: q.id,
        q: q.q,
        a: q.a,
        b: q.b,
        c: q.c,
        d: q.d,
        correct: q.correct,
        explanation: q.explanation
      }))
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / BULK INJECT
app.post('/api/questions', checkAdminAuth, (req, res) => {
  const { course, title, timeLimit, questions } = req.body;

  if (!questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Payload must contain a questions array.' });
  }

  const courseName = course || 'General';
  const examTitle = title || 'Examination Module';
  const tLimit = parseInt(timeLimit, 10) || 60;
  const modId = `${courseName.replace(/\s+/g, '_')}_${Date.now()}`;

  try {
    db.prepare(`
      INSERT INTO modules (id, course, title, time_limit)
      VALUES (?, ?, ?, ?)
    `).run(modId, courseName, examTitle, tLimit);

    const insertQuestion = db.prepare(`
      INSERT INTO questions (module_id, q, a, b, c, d, correct, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const q of questions) {
      insertQuestion.run(
        modId,
        q.q,
        q.a || '',
        q.b || '',
        q.c || '',
        q.d || '',
        q.correct || 'a',
        q.explanation || ''
      );
    }

    res.json({ success: true, message: 'Module and questions saved to SQLite.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT / EDIT single question
app.put('/api/questions/item/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const { q, a, b, c, d, correct, explanation } = req.body;

  try {
    db.prepare(`
      UPDATE questions 
      SET q = ?, a = ?, b = ?, c = ?, d = ?, correct = ?, explanation = ?
      WHERE id = ?
    `).run(q, a, b, c, d, correct, explanation, id);

    res.json({ success: true, message: 'Question updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE single question
app.delete('/api/questions/item/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM questions WHERE id = ?').run(id);
    res.json({ success: true, message: 'Question deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE module
app.delete('/api/questions/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM questions WHERE module_id = ?').run(id);
    db.prepare('DELETE FROM modules WHERE id = ?').run(id);
    res.json({ success: true, message: 'Module deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Ezrelyn AI Proctor Engine running on http://localhost:${PORT}`);
});
