import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple .env parser
if (fs.existsSync(path.join(__dirname, '.env'))) {
    const envConfig = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length === 2) {
            process.env[parts[0].trim()] = parts[1].trim();
        }
    });
}

const app = express();
const PORT = process.env.PORT || 8080;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'scientist2026';

app.use(express.json());
app.use(express.static(__dirname));

// Initialize SQLite Database using DatabaseSync
const db = new DatabaseSync('database.sqlite');

db.exec(`
    CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course TEXT,
        title TEXT,
        timeLimit INTEGER,
        questions TEXT
    )
`);

// Auto-migration: ensure timeLimit column exists if table was created previously without it
try {
    db.exec(`ALTER TABLE modules ADD COLUMN timeLimit INTEGER DEFAULT 45`);
} catch (e) {
    // Column already exists, ignore error
}

// Verify Admin Password Endpoint
app.post('/api/admin/verify', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// Get all exam modules
app.get('/api/questions', (req, res) => {
    try {
        const query = db.prepare('SELECT * FROM modules');
        const rows = query.all();
        const modules = rows.map(row => ({
            ...row,
            questions: JSON.parse(row.questions)
        }));
        res.json(modules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Inject new exam module (Admin only)
app.post('/api/questions', (req, res) => {
    const adminPwd = req.headers['x-admin-password'];
    if (adminPwd !== ADMIN_PASSWORD) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const { course, title, timeLimit, questions } = req.body;
    try {
        const insert = db.prepare('INSERT INTO modules (course, title, timeLimit, questions) VALUES (?, ?, ?, ?)');
        insert.run(course, title, Number(timeLimit), JSON.stringify(questions));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete exam module (Admin only)
app.delete('/api/questions/:id', (req, res) => {
    const adminPwd = req.headers['x-admin-password'];
    if (adminPwd !== ADMIN_PASSWORD) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    try {
        const remove = db.prepare('DELETE FROM modules WHERE id = ?');
        remove.run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Block standard admin.html for security
app.get('/admin.html', (req, res) => {
    res.status(404).send('Not Found');
});

app.listen(PORT, () => {
    console.log(`Ezrelyn AI Proctor Server running on http://localhost:${PORT}`);
});
