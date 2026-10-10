let rawModules = [];

document.addEventListener('DOMContentLoaded', () => {
  initStudentSession();
  fetchAndRenderCourses();

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderCourseHierarchy(e.target.value.toLowerCase().trim());
    });
  }
});

function initStudentSession() {
  let name = localStorage.getItem('studentName');
  if (!name || name.trim() === '') {
    name = 'Student';
  }
  updateUserNameUI(name);
}

function updateUserNameUI(name) {
  const headerName = document.getElementById('headerUserName');
  const welcomeHeading = document.getElementById('welcomeHeading');

  if (headerName) headerName.textContent = name;
  if (welcomeHeading) welcomeHeading.textContent = `WELCOME, ${name.toUpperCase()}`;
}

function changeStudentName() {
  const current = localStorage.getItem('studentName') || '';
  const newName = prompt('Enter your student name:', current);
  if (newName && newName.trim() !== '') {
    localStorage.setItem('studentName', newName.trim());
    updateUserNameUI(newName.trim());
  }
}

async function fetchAndRenderCourses() {
  const container = document.getElementById('courseAccordion');
  if (!container) return;

  container.innerHTML = `<p style="color: #94a3b8; text-align: center; padding: 40px;">⚡ Loading academic course hierarchy from SQLite...</p>`;

  try {
    const res = await fetch('/api/questions');
    if (!res.ok) throw new Error(`Server status ${res.status}`);

    rawModules = await res.json();
    renderCourseHierarchy('');
  } catch (err) {
    console.error('Failed to load courses:', err);
    container.innerHTML = `
      <div style="text-align: center; color: #ef4444; padding: 40px;">
        <h3>Unable to Fetch Course Modules</h3>
        <p style="color: #94a3b8; margin-top: 8px;">Ensure server is online on port 8080.</p>
      </div>
    `;
  }
}

function renderCourseHierarchy(query) {
  const container = document.getElementById('courseAccordion');
  if (!container) return;

  const grouped = {};
  rawModules.forEach(mod => {
    const courseKey = (mod.course || 'GENERAL').toUpperCase();
    if (!grouped[courseKey]) {
      grouped[courseKey] = {
        courseCode: courseKey,
        modules: []
      };
    }
    grouped[courseKey].modules.push(mod);
  });

  const filteredCourses = Object.values(grouped).filter(group => {
    const matchesCourse = group.courseCode.toLowerCase().includes(query);
    const matchesModuleTitle = group.modules.some(m => (m.title || '').toLowerCase().includes(query));
    return matchesCourse || matchesModuleTitle;
  });

  if (filteredCourses.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: #94a3b8; padding: 50px;">
        <h3>No Matching Courses Found</h3>
        <p style="margin-top: 8px;">Try searching for another keyword or inject new modules in the Admin Vault.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredCourses.map(group => {
    const totalQuestions = group.modules.reduce((acc, m) => acc + (m.questions ? m.questions.length : 0), 0);
    const totalExams = group.modules.length;

    return `
      <div class="course-group" id="group-${group.courseCode.replace(/\s+/g, '_')}">
        <div class="course-header" onclick="toggleCourseGroup('group-${group.courseCode.replace(/\s+/g, '_')}')">
          <div class="course-info">
            <span class="course-code">${escapeHtml(group.courseCode)}</span>
            <div>
              <div class="course-title-text">${getCourseFullTitle(group.courseCode)}</div>
              <div class="course-meta">📚 ${totalExams} Exam Module${totalExams > 1 ? 's' : ''} &nbsp;•&nbsp; 📋 ${totalQuestions} Total Questions</div>
            </div>
          </div>
          <div class="expand-icon">▼</div>
        </div>

        <div class="exam-modules-panel">
          <div class="exam-card-list">
            ${group.modules.map(mod => `
              <div class="exam-subcard">
                <div class="exam-details">
                  <h4>${escapeHtml(mod.title || 'Examination Module')}</h4>
                  <p>
                    <span>📋 ${mod.questions ? mod.questions.length : 0} Questions</span>
                    <span>⏱️ ${mod.timeLimit || 60} Minutes</span>
                  </p>
                </div>
                <button class="btn-launch" onclick="launchExam('${escapeHtml(mod.id)}')">START EXAM</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleCourseGroup(groupId) {
  const el = document.getElementById(groupId);
  if (!el) return;
  el.classList.toggle('open');
}

function launchExam(moduleId) {
  window.location.href = `/exam.html?module=${encodeURIComponent(moduleId)}`;
}

function getCourseFullTitle(code) {
  const titles = {
    'UNIV 1001': 'Online Education Strategies & Academic Success',
    'CS 1101': 'Programming Fundamentals & Computer Science Principles',
    'CS 1102': 'Basic Programming & Systems Architecture',
    'CS 2203': 'Databases & Relational Management Systems'
  };
  return titles[code] || 'Comprehensive Academic Course Module';
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}
