import express from 'express';
import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-load local .env file
if (fs.existsSync('.env')) {
    const envConfig = fs.readFileSync('.env', 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
            process.env[key.trim()] = val;
        }
    });
}

const app = express();
const PORT = process.env.PORT || 8080;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

app.use(express.json());

// Serve sitemap explicitly with XML content type
app.get('/sitemap.xml', (req, res) => {
    const filePath = path.join(__dirname, 'sitemap.xml');
    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'application/xml');
        return res.sendFile(filePath);
    }
    res.status(404).send('Not found');
});

// Serve static files globally
app.use(express.static(__dirname));

// API: Get all stored topics/question packs from disk
app.get('/api/topics', (req, res) => {
    try {
        if (fs.existsSync('questions.json')) {
            const data = fs.readFileSync('questions.json', 'utf8');
            return res.json(JSON.parse(data));
        }
        res.json([]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Verify Admin Secret Key
app.post('/api/admin/verify', (req, res) => {
    try {
        const { password } = req.body;
        if (!ADMIN_SECRET) {
            return res.status(500).json({ success: false, error: 'ADMIN_SECRET not configured.' });
        }
        if (password === ADMIN_SECRET) {
            return res.json({ success: true });
        }
        res.status(401).json({ success: false, error: 'Invalid security key' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API: Save new topic pack to disk
app.post('/api/admin/save-topic', (req, res) => {
    try {
        const newTopic = req.body;
        let topics = [];
        if (fs.existsSync('questions.json')) {
            topics = JSON.parse(fs.readFileSync('questions.json', 'utf8'));
        }
        topics.push(newTopic);
        fs.writeFileSync('questions.json', JSON.stringify(topics, null, 2), 'utf8');
        res.json({ success: true, message: 'Topic pack saved successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API: Update existing topic pack
app.put('/api/admin/topic/:index', (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const updatedData = req.body;
        if (fs.existsSync('questions.json')) {
            let topics = JSON.parse(fs.readFileSync('questions.json', 'utf8'));
            if (index >= 0 && index < topics.length) {
                topics[index] = updatedData;
                fs.writeFileSync('questions.json', JSON.stringify(topics, null, 2), 'utf8');
                return res.json({ success: true, message: 'Topic updated successfully' });
            }
        }
        res.status(404).json({ success: false, error: 'Topic not found' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API: Delete topic pack
app.delete('/api/admin/topic/:index', (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        if (fs.existsSync('questions.json')) {
            let topics = JSON.parse(fs.readFileSync('questions.json', 'utf8'));
            if (index >= 0 && index < topics.length) {
                topics.splice(index, 1);
                fs.writeFileSync('questions.json', JSON.stringify(topics, null, 2), 'utf8');
                return res.json({ success: true, message: 'Topic deleted successfully' });
            }
        }
        res.status(404).json({ success: false, error: 'Topic not found' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Ezrelyn Proctor AI server running on port ${PORT}`);
});
