import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

app.post('/api/admin/verify', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.get('/api/questions', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const modules = JSON.parse(data);
        res.json(modules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/questions', (req, res) => {
    const adminPwd = req.headers['x-admin-password'];
    if (adminPwd !== ADMIN_PASSWORD) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const { course, title, timeLimit, level, questions } = req.body;
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const modules = JSON.parse(data);
        
        const newModule = {
            id: Date.now(),
            level: level || course || 'Computer Science',
            subject: course || 'cs1101',
            title: title || 'Examination Module',
            time: String(timeLimit || 45),
            questions: questions || []
        };

        modules.push(newModule);
        fs.writeFileSync(DATA_FILE, JSON.stringify(modules, null, 2), 'utf8');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Update / Edit exam module
app.put('/api/questions/:id', (req, res) => {
    const adminPwd = req.headers['x-admin-password'];
    if (adminPwd !== ADMIN_PASSWORD) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const { course, title, timeLimit, level, questions } = req.body;
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        let modules = JSON.parse(data);
        
        const index = modules.findIndex(m => m.id == req.params.id);
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Module not found' });
        }

        modules[index] = {
            ...modules[index],
            level: level || modules[index].level,
            subject: course || modules[index].subject,
            title: title || modules[index].title,
            time: String(timeLimit || modules[index].time),
            questions: questions || modules[index].questions
        };

        fs.writeFileSync(DATA_FILE, JSON.stringify(modules, null, 2), 'utf8');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/questions/:id', (req, res) => {
    const adminPwd = req.headers['x-admin-password'];
    if (adminPwd !== ADMIN_PASSWORD) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        let modules = JSON.parse(data);
        
        modules = modules.filter(m => m.id != req.params.id);
        fs.writeFileSync(DATA_FILE, JSON.stringify(modules, null, 2), 'utf8');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Ezrelyn AI Proctor Server running on http://localhost:${PORT}`);
});
