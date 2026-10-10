const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'scientist2026';

const DATA_FILE = path.join(__dirname, 'modules.json');

// Initialize modules.json with default 20Q UNIV 1001 predictor if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  const initialData = [
    {
      "id": "UNIV1001_CORE_20Q",
      "course": "UNIV 1001",
      "title": "Course Final Examination Predictor (20Q Quick Version)",
      "timeLimit": 45,
      "questions": [
        {
          "id": 1,
          "q": "What is the primary cognitive risk associated with a rigid 'Performance-Based Mindset'?",
          "a": "It guarantees that a student will achieve a perfect institutional GPA.",
          "b": "It causes an exponential increase in neuroplastic pathway generation.",
          "c": "It completely eliminates the possibility of digital social media distractions.",
          "d": "It forces a student to prioritize grades and validation over true deep learning, causing them to avoid hard challenges.",
          "correct": "d",
          "explanation": "A performance mindset focuses on external validation and avoiding failure, leading students to bypass challenging learning opportunities."
        },
        {
          "id": 2,
          "q": "In an APA 7th edition reference list, how must the title of a standard published book be formatted textually?",
          "a": "Underlined with a solid line",
          "b": "Written entirely in capital letters",
          "c": "Enclosed within double quotation marks",
          "d": "Italicized",
          "correct": "d",
          "explanation": "In APA 7th edition, book titles in reference lists are formatted in sentence-case italics."
        },
        {
          "id": 3,
          "q": "What is the primary benefit of a structured evaluation rubric for both instructors and active learners?",
          "a": "It provides clear performance guidelines and clear accountability for academic execution.",
          "b": "It allows participants to bypass the mandatory unit readings.",
          "c": "It completely eliminates the requirement for personalized feedback notes.",
          "d": "It guarantees an automatic perfect grade score for all submissions.",
          "correct": "a",
          "explanation": "Rubrics clearly define expectations, criteria, and performance levels for students and evaluators."
        },
        {
          "id": 4,
          "q": "According to Carol Dweck's growth mindset model, how should a student frame a severe conceptual error or assignment failure?",
          "a": "By immediately abandoning the task to protect their mental well-being.",
          "b": "By assuming the grading instructor possesses a negative institutional bias.",
          "c": "As definitive evidence of an inherent lack of natural intelligence.",
          "d": "By utilizing the 'Power of Yet' to reframe the error as an ongoing developmental process.",
          "correct": "d",
          "explanation": "Dweck's framework uses 'Yet' to reframe temporary setbacks as active steps toward skill mastery."
        },
        {
          "id": 5,
          "q": "What does the 'S' represent in the classic SMART goal setting framework?",
          "a": "Strategic",
          "b": "Sustainable",
          "c": "Specific",
          "d": "Simple",
          "correct": "c",
          "explanation": "SMART stands for Specific, Measurable, Achievable, Relevant, and Time-bound."
        },
        {
          "id": 6,
          "q": "Which specific tool within the Eisenhower Decision Matrix should a student use to organize daily tasks before sleeping?",
          "a": "A linear list that focuses exclusively on easy tasks first.",
          "b": "A software tracker that monitors typing speed metrics.",
          "c": "A digital timer that rings loudly every 25 minutes.",
          "d": "A matrix dividing tasks into Urgent versus Important blocks.",
          "correct": "d",
          "explanation": "The Eisenhower Matrix categorizes tasks into four quadrants based on urgency and importance."
        },
        {
          "id": 7,
          "q": "If a student encounters a roadblock regarding assignment specifications or needs clarification on a specific unit topic, who is the primary point of contact?",
          "a": "Student Services Support",
          "b": "The Academic Advisor",
          "c": "The Course Instructor",
          "d": "The Admissions Coordinator",
          "correct": "c",
          "explanation": "Course Instructors manage academic delivery and are the direct point of contact for unit topic inquiries."
        },
        {
          "id": 8,
          "q": "If you change information from a textbook into your own vocabulary, which of the following rules governs your writing?",
          "a": "A citation must be added because you are summarizing or paraphrasing an author's original idea.",
          "b": "No reference is required since the phrasing is unique.",
          "c": "Citations are only mandatory if you quote more than three consecutive sentences.",
          "d": "References are completely waived if the source text is an open educational resource (OER).",
          "correct": "a",
          "explanation": "Paraphrasing requires an in-text citation to acknowledge the original source of the intellectual concept."
        },
        {
          "id": 9,
          "q": "For how many consecutive days does the Final Exam terminal remain open for student completion across all standard university courses?",
          "a": "7 days",
          "b": "3 days",
          "c": "1 day",
          "d": "4 days",
          "correct": "d",
          "explanation": "Final Exam windows typically run for 4 consecutive days (Thursday through Sunday of Unit 9)."
        },
        {
          "id": 10,
          "q": "How must a standard APA 7th edition Reference List be ordered structurally at the termination of an essay?",
          "a": "Alphabetically by the authors' last names.",
          "b": "Chronologically by the specific publication dates of the sources.",
          "c": "Categorized by the physical format of the media used.",
          "d": "In the exact order that the citations show up inside the body text.",
          "correct": "a",
          "explanation": "APA 7th edition reference lists are formatted alphabetically by the first author's last name."
        },
        {
          "id": 11,
          "q": "When analyzing data sources, a completely raw, unedited historical letter or archival diary is classified as a:",
          "a": "Secondary Source",
          "b": "Tertiary Index",
          "c": "Meta-Analysis",
          "d": "Primary Source",
          "correct": "d",
          "explanation": "Primary sources are direct, first-hand artifacts or original documents created during the period under study."
        },
        {
          "id": 12,
          "q": "In the context of evaluating digital source materials, what does the functional acronym SIFT stand for?",
          "a": "Stop, Investigate the source, Find better coverage, Trace claims to original context",
          "b": "Search, Identify, Forward, Track",
          "c": "Scan, Inspect, Filter, Tabulate",
          "d": "Source, Index, Format, Transfer",
          "correct": "a",
          "explanation": "SIFT is a web literacy evaluation methodology: Stop, Investigate source, Find better coverage, Trace claims."
        },
        {
          "id": 13,
          "q": "What specific type of academic integrity violation occurs when two or more students engage in unauthorized collaboration on a strictly individual task?",
          "a": "Fabrication",
          "b": "Collusion",
          "c": "Phishing",
          "d": "Self-Plagiarism",
          "correct": "b",
          "explanation": "Collusion is unauthorized collaboration between students on assignments designated for individual effort."
        },
        {
          "id": 14,
          "q": "What exact information is mandatory for an APA 7th edition in-text citation when a writer quotes a source word-for-word?",
          "a": "The student's name, Course code, and total Word count.",
          "b": "Author's full name, Publisher, and full web URL link.",
          "c": "Author's last name, Year of publication, and exact Page number.",
          "d": "Article title, Journal volume number, and Access date.",
          "correct": "c",
          "explanation": "Direct word-for-word quotes in APA 7 require Author last name, Year, and Page number (e.g., Smith, 2020, p. 15)."
        },
        {
          "id": 15,
          "q": "According to the University of the People institutional framework, how many hours per week must a student dedicate to independent study for each course?",
          "a": "10 - 12 hours",
          "b": "15 - 17 hours",
          "c": "20 hours or more",
          "d": "5 - 7 hours",
          "correct": "b",
          "explanation": "UoPeople academic guidelines prescribe 15 to 17 hours per week of dedicated study per course."
        },
        {
          "id": 16,
          "q": "What structural design defines the famous Cornell Note-Taking Method?",
          "a": "A single grid broken into three sections: a note-taking zone, a cue column, and a summary block.",
          "b": "A chronological text stream containing verbatim lecture transcripts.",
          "c": "A circular mind map connected by branching colored lines.",
          "d": "A digital spreadsheet cataloging external hyperlinks by units.",
          "correct": "a",
          "explanation": "The Cornell Method structures notes into a main Note-taking area, a left Cue column, and a bottom Summary block."
        },
        {
          "id": 17,
          "q": "When compiling an academic paper, what form of academic dishonesty occurs if you invent data or create completely artificial references?",
          "a": "Cheating",
          "b": "Fabrication",
          "c": "Plagiarism",
          "d": "Collusion",
          "correct": "b",
          "explanation": "Fabrication is the intentional falsification or invention of data, quotes, or references."
        },
        {
          "id": 18,
          "q": "The standard University of the People Learning Week operates on which precise cyclical timeline?",
          "a": "Starts Friday morning and terminates Thursday evening.",
          "b": "Starts at midnight between Wednesday and Thursday and terminates on the following Wednesday.",
          "c": "Starts Monday at midnight and terminates Sunday night.",
          "d": "Starts Wednesday at midnight and terminates the following Tuesday.",
          "correct": "b",
          "explanation": "The UoPeople academic week opens Thursday at 00:05 UTC and closes the following Wednesday at 23:55 UTC."
        },
        {
          "id": 19,
          "q": "Based on cognitive psychology research outlined in your readings, what is the brain's baseline capacity regarding multitasking?",
          "a": "Multitasking is highly effective when executed using a mobile smartphone.",
          "b": "Multitasking optimizes cognitive capacity and reduces overall academic stress.",
          "c": "The human brain can process multiple complex cognitive lines simultaneously.",
          "d": "Multitasking is a myth; the human brain cannot efficiently focus on multiple tasks at once.",
          "correct": "d",
          "explanation": "Research shows the human brain rapidly task-switches rather than processing complex cognitive tasks simultaneously."
        },
        {
          "id": 20,
          "q": "Which psychological trait is defined as the persistent determination and passion toward an extensive, long-term milestone, regardless of immediate setbacks?",
          "a": "Extrinsic Motivation",
          "b": "Fixed Perception",
          "c": "Grit",
          "d": "Performance Orientation",
          "correct": "c",
          "explanation": "Grit is defined as perseverance and passion for long-term strategic goals."
        }
      ]
    }
  ];
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

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

// Helper to read data
function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

// Helper to write data
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET all modules
app.get('/api/questions', (req, res) => {
  const modules = readData();
  res.json(modules);
});

// POST / BULK INJECT Module
app.post('/api/questions', checkAdminAuth, (req, res) => {
  const { course, title, timeLimit, questions } = req.body;
  if (!questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Payload must contain a questions array.' });
  }

  const modules = readData();
  const courseName = course || 'General';
  const examTitle = title || 'Examination Module';
  const tLimit = parseInt(timeLimit, 10) || 60;
  const modId = `${courseName.replace(/\s+/g, '_')}_${Date.now()}`;

  const formattedQuestions = questions.map((q, idx) => ({
    id: Date.now() + idx,
    q: q.q,
    a: q.a || '',
    b: q.b || '',
    c: q.c || '',
    d: q.d || '',
    correct: q.correct || 'a',
    explanation: q.explanation || ''
  }));

  modules.push({
    id: modId,
    course: courseName,
    title: examTitle,
    timeLimit: tLimit,
    questions: formattedQuestions
  });

  writeData(modules);
  res.json({ success: true, message: 'Module injected successfully!' });
});

// PUT / EDIT single question
app.put('/api/questions/item/:id', checkAdminAuth, (req, res) => {
  const qId = parseInt(req.params.id, 10);
  const { q, a, b, c, d, correct, explanation } = req.body;
  const modules = readData();

  let found = false;
  modules.forEach(mod => {
    mod.questions.forEach(item => {
      if (item.id === qId) {
        item.q = q;
        item.a = a;
        item.b = b;
        item.c = c;
        item.d = d;
        item.correct = correct;
        item.explanation = explanation;
        found = true;
      }
    });
  });

  if (found) {
    writeData(modules);
    res.json({ success: true, message: 'Question updated.' });
  } else {
    res.status(404).json({ error: 'Question not found.' });
  }
});

// DELETE single question
app.delete('/api/questions/item/:id', checkAdminAuth, (req, res) => {
  const qId = parseInt(req.params.id, 10);
  const modules = readData();

  modules.forEach(mod => {
    mod.questions = mod.questions.filter(item => item.id !== qId);
  });

  writeData(modules);
  res.json({ success: true, message: 'Question deleted.' });
});

// DELETE entire module
app.delete('/api/questions/:id', checkAdminAuth, (req, res) => {
  const modId = req.params.id;
  let modules = readData();
  modules = modules.filter(m => m.id !== modId);
  writeData(modules);
  res.json({ success: true, message: 'Module deleted.' });
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
