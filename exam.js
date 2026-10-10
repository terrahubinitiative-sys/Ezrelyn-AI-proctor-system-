let currentExam = null;
let userAnswers = {};
let timerInterval = null;
let timeRemaining = 0;
let isSubmitted = false;

document.addEventListener('DOMContentLoaded', () => {
  initExamSession();
  setupProctorProtection();
});

async function initExamSession() {
  const urlParams = new URLSearchParams(window.location.search);
  const moduleId = urlParams.get('module');
  const studentName = localStorage.getItem('studentName') || 'Student';

  if (!moduleId) {
    alert('No examination module specified.');
    window.location.href = '/dashboard.html';
    return;
  }

  try {
    const res = await fetch('/api/questions');
    const modules = await res.json();
    currentExam = modules.find(m => m.id === moduleId);

    if (!currentExam || !currentExam.questions || currentExam.questions.length === 0) {
      alert('Exam module not found or contains no questions.');
      window.location.href = '/dashboard.html';
      return;
    }

    document.getElementById('examModuleTitle').textContent = `${currentExam.course}: ${currentExam.title}`;
    document.getElementById('studentSessionMeta').textContent = `Candidate: ${studentName} | Total Questions: ${currentExam.questions.length}`;

    timeRemaining = (currentExam.timeLimit || 45) * 60;
    startTimer();
    renderAllQuestionsOnePage();
  } catch (err) {
    console.error('Error starting exam session:', err);
    alert('Failed to load examination session.');
    window.location.href = '/dashboard.html';
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      alert('Time expired! Submitting exam automatically.');
      submitExam();
      return;
    }
    timeRemaining--;
    const mins = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const secs = (timeRemaining % 60).toString().padStart(2, '0');
    document.getElementById('timerDisplay').textContent = `⏱️ ${mins}:${secs}`;
  }, 1000);
}

function renderAllQuestionsOnePage() {
  const container = document.getElementById('questionsList');

  container.innerHTML = currentExam.questions.map((q, idx) => {
    const opts = [
      { key: 'a', val: q.a },
      { key: 'b', val: q.b },
      { key: 'c', val: q.c },
      { key: 'd', val: q.d }
    ].filter(o => o.val && o.val !== 'N/A');

    return `
      <div class="q-card" id="qCard-${idx}">
        <div class="q-number">QUESTION ${idx + 1} OF ${currentExam.questions.length}</div>
        <div class="q-text">${escapeHtml(q.q)}</div>

        <div class="options-grid">
          ${opts.map(o => `
            <div class="opt-label" id="opt-${idx}-${o.key}" onclick="selectAnswer(${idx}, '${o.key}')">
              <input type="radio" name="q_${idx}" value="${o.key}" style="accent-color: #38bdf8;">
              <span><b style="color: #38bdf8;">${o.key.toUpperCase()}.</b>${escapeHtml(o.val)}</span>
            </div>
          `).join('')}
        </div>

        <div class="explanation-box" id="exp-${idx}">
          <b>💡 Explanation & Solution:</b> ${escapeHtml(q.explanation || 'No explanation provided.')}
        </div>
      </div>
    `;
  }).join('');
}

function selectAnswer(qIndex, optionKey) {
  if (isSubmitted) return;

  userAnswers[qIndex] = optionKey;

  const card = document.getElementById(`qCard-${qIndex}`);
  const labels = card.querySelectorAll('.opt-label');
  labels.forEach(l => l.classList.remove('selected'));

  const selectedLabel = document.getElementById(`opt-${qIndex}-${optionKey}`);
  if (selectedLabel) {
    selectedLabel.classList.add('selected');
    const radio = selectedLabel.querySelector('input');
    if (radio) radio.checked = true;
  }
}

function setupProctorProtection() {
  window.addEventListener('blur', () => {
    if (!isSubmitted) triggerProctorViolation();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !isSubmitted) triggerProctorViolation();
  });
}

function triggerProctorViolation() {
  isSubmitted = true;
  clearInterval(timerInterval);
  document.getElementById('flaggedOverlay').style.display = 'flex';
}

function submitExam() {
  if (isSubmitted) return;
  isSubmitted = true;
  clearInterval(timerInterval);

  let score = 0;

  currentExam.questions.forEach((q, idx) => {
    const userChoice = userAnswers[idx];
    const correctChoice = (q.correct || 'a').toLowerCase();

    const correctLabel = document.getElementById(`opt-${idx}-${correctChoice}`);
    if (correctLabel) correctLabel.classList.add('correct-target');

    if (userChoice) {
      if (userChoice === correctChoice) {
        score++;
      } else {
        const wrongLabel = document.getElementById(`opt-${idx}-${userChoice}`);
        if (wrongLabel) wrongLabel.classList.add('wrong-choice');
      }
    }

    const expBox = document.getElementById(`exp-${idx}`);
    if (expBox) expBox.style.display = 'block';
  });

  const percentage = Math.round((score / currentExam.questions.length) * 100);

  document.getElementById('scoreHeader').textContent = `FINAL SCORE: ${score} / ${currentExam.questions.length} (${percentage}%)`;
  document.getElementById('scoreCard').style.display = 'block';
  document.getElementById('submitBar').style.display = 'none';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function downloadPdfReport() {
  const element = document.getElementById('pdfReportContent');
  const studentName = localStorage.getItem('studentName') || 'Student';

  const opt = {
    margin: 0.3,
    filename: `${studentName.replace(/\s+/g, '_')}_Exam_Results.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}
