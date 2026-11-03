import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 8080;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'scientist2026';

app.use(express.json());
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, 'questions.json');
const RESULTS_FILE = path.join(__dirname, 'results.json');

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(RESULTS_FILE)) {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify([], null, 2));
}

app.post('/api/admin/verify', (req, res) => {
    const { password } = req.body;
    res.json({ success: password === ADMIN_PASSWORD });
});

app.get('/api/questions', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save or add topic-based question pack
app.post('/api/questions', (req, res) => {
    if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const { level, course, topic, timeLimit, questions } = req.body;
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        let modules = JSON.parse(data);
        
        const newModule = {
            id: Date.now(),
            level: level || 'Computer Science',
            subject: course || 'cs1101',
            topic: topic || 'General Topic',
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

// Update topic module
app.put('/api/questions/:id', (req, res) => {
    if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const { level, course, topic, timeLimit, questions } = req.body;
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        let modules = JSON.parse(data);
        const index = modules.findIndex(m => m.id == req.params.id);
        if (index === -1) return res.status(404).json({ success: false, error: 'Not found' });

        modules[index] = {
            ...modules[index],
            level: level || modules[index].level,
            subject: course || modules[index].subject,
            topic: topic || modules[index].topic,
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
    if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
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
    console.log(`Ezrelyn AI Proctor running on http://localhost:${PORT}`);
});
