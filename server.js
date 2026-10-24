import express from 'express';
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

const DATA_FILE = path.join(__dirname, 'questions.json');

// Ensure questions.json exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
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

// Get all exam modules from questions.json
app.get('/api/questions', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const modules = JSON.parse(data);
        res.json(modules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Inject or Update exam module into questions.json (Admin only)
app.post('/api/questions', (req, res) => {
    const adminPwd = req.headers['x-admin-password'];
    if (adminPwd !== ADMIN_PASSWORD) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const { course, title, timeLimit, questions } = req.body;
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const modules = JSON.parse(data);
        
        const newModule = {
            id: Date.now(), // Unique ID based on timestamp
            course,
            title,
            timeLimit: Number(timeLimit) || 45,
            questions
        };

        modules.push(newModule);
        fs.writeFileSync(DATA_FILE, JSON.stringify(modules, null, 2));
        
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
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        let modules = JSON.parse(data);
        
        modules = modules.filter(m => m.id != req.params.id);
        fs.writeFileSync(DATA_FILE, JSON.stringify(modules, null, 2));
        
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
